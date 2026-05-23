import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Env } from "../../config/env.schema";
import { EmailService } from "../email/email.service";
import { reminderInviteEmail } from "../email/templates";

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  // Esegue ogni giorno alle 09:00 server time
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyReminders(): Promise<void> {
    this.logger.log("Avvio job reminder giornaliero");
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const events = await this.prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        startAt: { gte: now, lte: in7days },
      },
    });
    let sent = 0;
    for (const event of events) {
      sent += await this.runForEvent(event.id);
    }
    this.logger.log(`Reminder giornaliero: ${sent} email inviate per ${events.length} eventi`);
  }

  async runForEvent(eventId: string): Promise<number> {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return 0;
    const invites = await this.prisma.invitation.findMany({
      where: {
        eventId,
        email: { not: null },
        source: { in: ["MANUAL", "CSV"] },
      },
    });
    if (invites.length === 0) return 0;
    const existingEmails = new Set(
      (
        await this.prisma.participant.findMany({
          where: { eventId, email: { in: invites.map((i) => i.email!) } },
          select: { email: true },
        })
      ).map((p) => p.email),
    );
    const appUrl = this.config.get("APP_PUBLIC_URL", { infer: true });
    const locationLabel = event.locationType === "ONLINE" ? "Online" : (event.locationName ?? "—");
    let sent = 0;
    for (const inv of invites) {
      if (!inv.email) continue;
      if (existingEmails.has(inv.email)) continue;
      const inviteUrl = `${appUrl}/e/${event.slug}?t=${inv.token}`;
      await this.email.send({
        to: inv.email,
        subject: `Promemoria - ${event.name}`,
        html: reminderInviteEmail(event.name, event.startAt, locationLabel, inviteUrl, event.coverImageUrl),
      });
      await this.prisma.invitation.update({ where: { id: inv.id }, data: { sentAt: new Date() } });
      sent++;
    }
    return sent;
  }
}
