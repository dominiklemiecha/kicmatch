import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { type Transporter } from "nodemailer";
import type { Env } from "../../config/env.schema";

interface InlineAttachment {
  filename: string;
  content: Buffer | string;
  encoding?: "base64";
  cid: string;
  contentType?: string;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: InlineAttachment[];
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

function parseFrom(from: string): { name?: string; email: string } {
  const match = /^(.*?)\s*<(.+?)>\s*$/.exec(from);
  if (match) return { name: match[1].trim() || undefined, email: match[2].trim() };
  return { email: from };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;
  private readonly brevoApiKey: string | undefined;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.from = this.config.get("EMAIL_FROM", { infer: true });
    this.brevoApiKey = this.config.get("BREVO_API_KEY", { infer: true });

    if (this.brevoApiKey) {
      this.logger.log("Email transport: Brevo HTTP API");
      this.transporter = null;
      return;
    }

    const host = this.config.get("EMAIL_HOST", { infer: true });
    if (!host) {
      this.logger.warn("Nessun transport email configurato: email solo in console log");
      this.transporter = null;
      return;
    }
    const user = this.config.get("EMAIL_USER", { infer: true });
    const pass = this.config.get("EMAIL_PASS", { infer: true });
    this.transporter = nodemailer.createTransport({
      host,
      port: this.config.get("EMAIL_PORT", { infer: true }),
      secure: this.config.get("EMAIL_SECURE", { infer: true }),
      auth: user && pass ? { user, pass } : undefined,
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
    this.logger.log(`Email transport: SMTP (host=${host})`);
  }

  async send(args: SendArgs): Promise<void> {
    if (this.brevoApiKey) {
      await this.sendViaBrevo(args, this.brevoApiKey);
      return;
    }
    if (!this.transporter) {
      this.logger.log(`[DEV EMAIL] To: ${args.to} | Subject: ${args.subject}`);
      return;
    }
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text ?? htmlToText(args.html),
        attachments: args.attachments,
      });
      this.logger.log(`Email inviata a ${args.to} (id=${info.messageId}): ${args.subject}`);
    } catch (err) {
      this.logger.error(`Errore invio email a ${args.to}`, err as Error);
    }
  }

  private async sendViaBrevo(args: SendArgs, apiKey: string): Promise<void> {
    // Brevo HTTP API does not support cid: inline images — inline as data URIs
    let html = args.html;
    for (const att of args.attachments ?? []) {
      const base64 = att.content instanceof Buffer ? att.content.toString("base64") : att.content;
      const mime = att.contentType ?? "image/png";
      html = html.replaceAll(`cid:${att.cid}`, `data:${mime};base64,${base64}`);
    }

    const sender = parseFrom(this.from);
    const body = {
      sender,
      to: [{ email: args.to }],
      subject: args.subject,
      htmlContent: html,
      textContent: args.text ?? htmlToText(html),
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Brevo API HTTP ${res.status} a ${args.to}: ${text}`);
        return;
      }
      const data = (await res.json()) as { messageId?: string };
      this.logger.log(`Email inviata via Brevo a ${args.to} (id=${data.messageId}): ${args.subject}`);
    } catch (err) {
      this.logger.error(`Errore Brevo API a ${args.to}`, err as Error);
    } finally {
      clearTimeout(timer);
    }
  }
}
