import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { User } from "@prisma/client";
import * as argon2 from "argon2";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Env } from "../../config/env.schema";
import type { LoginInput, RegisterInput } from "@kicmatch/shared";
import { EmailService } from "../email/email.service";
import { passwordResetEmail, welcomeOrganizerEmail } from "../email/templates";
import type { JwtPayload } from "./jwt.strategy";

const REFRESH_TTL_DAYS = 30;
const ACCESS_TTL = "15m";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
    private readonly email: EmailService,
  ) {}

  async register(input: RegisterInput): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const exists = await this.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (exists) throw new ConflictException("Email già registrata");
    const passwordHash = await argon2.hash(input.password);
    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });
    const appUrl = this.config.get("APP_PUBLIC_URL", { infer: true }) ?? "";
    void this.email.send({
      to: user.email,
      subject: "Benvenuto su Kicmatch 🎉",
      html: welcomeOrganizerEmail(user.firstName, `${appUrl}/dashboard`),
    });
    return this.issueTokens(user);
  }

  async login(input: LoginInput): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user) throw new UnauthorizedException("Credenziali non valide");
    const ok = await argon2.verify(user.passwordHash, input.password);
    if (!ok) throw new UnauthorizedException("Credenziali non valide");
    if (user.isBlocked) throw new UnauthorizedException("Account bloccato. Contatta il supporto.");
    return this.issueTokens(user);
  }

  async refresh(rawRefreshToken: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const hash = this.hashToken(rawRefreshToken);
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash: hash }, include: { user: true } });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh non valido");
    }
    // Rotate: revoke current, issue new
    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(record.user);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    const hash = this.hashToken(rawRefreshToken);
    await this.prisma.refreshToken.updateMany({ where: { tokenHash: hash, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async getUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Do not reveal whether the email exists. Silently succeed if not found.
    if (!user || user.isBlocked) return;
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
    const appUrl = this.config.get("APP_PUBLIC_URL", { infer: true }) ?? "";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
    void this.email.send({
      to: user.email,
      subject: "Reimposta la tua password Kicmatch",
      html: passwordResetEmail(user.firstName, resetUrl),
    });
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Link non valido o scaduto");
    }
    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      // Revoke all active refresh tokens — force re-login on every device
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  async updateProfile(userId: string, body: Record<string, unknown>): Promise<User> {
    const allowed = [
      "firstName", "lastName", "profileType", "profileName", "country",
      "avatarUrl", "bio", "website", "ibanDefault", "ibanHolderDefault",
    ] as const;
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  private async issueTokens(user: User): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get("JWT_ACCESS_SECRET", { infer: true }),
      expiresIn: ACCESS_TTL,
    });
    const refreshToken = randomBytes(48).toString("hex");
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
      },
    });
    return { user, accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
