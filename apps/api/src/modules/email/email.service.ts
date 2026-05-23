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

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService<Env, true>) {
    const host = this.config.get("EMAIL_HOST", { infer: true });
    this.from = this.config.get("EMAIL_FROM", { infer: true });
    if (!host) {
      this.logger.warn("EMAIL_HOST non configurato: email solo in console log");
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
    });
    this.logger.log(`Email SMTP configurato (host=${host})`);
  }

  async send(args: SendArgs): Promise<void> {
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
}
