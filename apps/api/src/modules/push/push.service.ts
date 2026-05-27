import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createSign } from "node:crypto";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Env } from "../../config/env.schema";

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Sends push notifications via Firebase Cloud Messaging HTTP v1.
 * Builds a service-account JWT in-process (no firebase-admin SDK) and
 * caches the OAuth2 access token until it expires.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private accessToken: { value: string; expiresAt: number } | null = null;

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {}

  private get isConfigured(): boolean {
    return Boolean(
      this.config.get("FCM_PROJECT_ID", { infer: true }) &&
        this.config.get("FCM_CLIENT_EMAIL", { infer: true }) &&
        this.config.get("FCM_PRIVATE_KEY", { infer: true }),
    );
  }

  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (this.accessToken && this.accessToken.expiresAt - 60 > now) {
      return this.accessToken.value;
    }
    const clientEmail = this.config.get("FCM_CLIENT_EMAIL", { infer: true })!;
    const rawKey = this.config.get("FCM_PRIVATE_KEY", { infer: true })!;
    // Allow the env var to use \n escapes (common when pasted into hosting UIs)
    const privateKey = rawKey.replace(/\\n/g, "\n");
    const header = { alg: "RS256", typ: "JWT" };
    const claim = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };
    const enc = (obj: unknown): string =>
      Buffer.from(JSON.stringify(obj)).toString("base64url");
    const signingInput = `${enc(header)}.${enc(claim)}`;
    const signer = createSign("RSA-SHA256");
    signer.update(signingInput);
    const signature = signer.sign(privateKey).toString("base64url");
    const jwt = `${signingInput}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`FCM auth failed ${res.status}: ${text}`);
    }
    const data = (await res.json()) as { access_token: string; expires_in: number };
    this.accessToken = { value: data.access_token, expiresAt: now + data.expires_in };
    return data.access_token;
  }

  private async sendToToken(token: string, payload: PushPayload): Promise<void> {
    const projectId = this.config.get("FCM_PROJECT_ID", { infer: true })!;
    const accessToken = await this.getAccessToken();
    const body = {
      message: {
        token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
        android: { priority: "HIGH" },
        apns: { headers: { "apns-priority": "10" } },
      },
    };
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (res.ok) return;
    const errText = await res.text();
    // If the token is invalid (uninstalled, refreshed), drop it from DB
    if (res.status === 404 || res.status === 400) {
      this.logger.warn(`FCM rejected token (${res.status}), removing: ${errText}`);
      await this.prisma.deviceToken.deleteMany({ where: { token } }).catch(() => undefined);
      return;
    }
    throw new Error(`FCM send failed ${res.status}: ${errText}`);
  }

  /**
   * Fire-and-forget: send to every device the user has registered. Failures
   * are logged but never propagate — push is best-effort and must not block
   * the request flow that triggers it (e.g. a Stripe webhook).
   */
  async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!this.isConfigured) return;
    const tokens = await this.prisma.deviceToken.findMany({ where: { userId }, select: { token: true } });
    if (tokens.length === 0) return;
    await Promise.all(
      tokens.map(({ token }) =>
        this.sendToToken(token, payload).catch((err) => {
          this.logger.error(`Push to ${token.slice(0, 8)}… failed`, err as Error);
        }),
      ),
    );
  }
}
