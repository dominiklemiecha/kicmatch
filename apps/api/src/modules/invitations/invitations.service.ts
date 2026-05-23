import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Invitation } from "@prisma/client";
import { randomBytes } from "crypto";
import type { CreateInvitationsInput } from "@kicmatch/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { Env } from "../../config/env.schema";
import { EmailService } from "../email/email.service";
import { invitationEmail } from "../email/templates";
import { EventsService } from "../events/events.service";

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly email: EmailService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async listForEvent(userId: string, eventId: string): Promise<Invitation[]> {
    await this.events.getById(userId, eventId);
    return this.prisma.invitation.findMany({ where: { eventId }, orderBy: { createdAt: "desc" } });
  }

  async createBulk(userId: string, eventId: string, input: CreateInvitationsInput): Promise<Invitation[]> {
    await this.events.getById(userId, eventId);
    if (input.source === "LINK") {
      const token = randomBytes(24).toString("hex");
      const created = await this.prisma.invitation.create({
        data: { eventId, source: "LINK", token, email: null },
      });
      return [created];
    }
    const emails = (input.emails ?? []).map((e) => e.toLowerCase().trim()).filter(Boolean);
    const unique = Array.from(new Set(emails));
    const created: Invitation[] = [];
    const event = await this.prisma.event.findUnique({ where: { id: eventId }, include: { user: true } });
    const appUrl = this.config.get("APP_PUBLIC_URL", { infer: true }) ?? "";
    for (const email of unique) {
      const exists = await this.prisma.invitation.findFirst({ where: { eventId, email } });
      if (exists) continue;
      const token = randomBytes(24).toString("hex");
      const inv = await this.prisma.invitation.create({
        data: { eventId, email, token, source: input.source },
      });
      created.push(inv);
      // Send invitation email (don't await, fire-and-forget per recipient)
      if (event && event.status === "PUBLISHED") {
        const organizerName = event.user.profileType === "BUSINESS"
          ? (event.user.profileName ?? `${event.user.firstName} ${event.user.lastName}`)
          : `${event.user.firstName} ${event.user.lastName}`;
        const inviteUrl = `${appUrl}/e/${event.slug}?invite=${token}`;
        void this.email.send({
          to: email,
          subject: `Sei invitato a ${event.name}`,
          html: invitationEmail(
            { name: event.name, startAt: event.startAt, endAt: event.endAt, locationType: event.locationType, locationName: event.locationName, locationAddress: event.locationAddress, onlineUrl: event.onlineUrl, coverImageUrl: event.coverImageUrl, slug: event.slug },
            organizerName,
            inviteUrl,
          ),
        });
      }
    }
    return created;
  }

  async resend(userId: string, eventId: string, invitationId: string): Promise<void> {
    await this.events.getById(userId, eventId);
    const inv = await this.prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!inv || inv.eventId !== eventId || !inv.email) return;
    const event = await this.prisma.event.findUnique({ where: { id: eventId }, include: { user: true } });
    if (!event) return;
    const appUrl = this.config.get("APP_PUBLIC_URL", { infer: true }) ?? "";
    const organizerName = event.user.profileType === "BUSINESS"
      ? (event.user.profileName ?? `${event.user.firstName} ${event.user.lastName}`)
      : `${event.user.firstName} ${event.user.lastName}`;
    const inviteUrl = `${appUrl}/e/${event.slug}?invite=${inv.token}`;
    await this.email.send({
      to: inv.email,
      subject: `Sei invitato a ${event.name}`,
      html: invitationEmail(
        { name: event.name, startAt: event.startAt, endAt: event.endAt, locationType: event.locationType, locationName: event.locationName, locationAddress: event.locationAddress, onlineUrl: event.onlineUrl, coverImageUrl: event.coverImageUrl, slug: event.slug },
        organizerName,
        inviteUrl,
      ),
    });
    await this.prisma.invitation.update({ where: { id: invitationId }, data: { sentAt: new Date() } });
  }

  async remove(userId: string, eventId: string, invitationId: string): Promise<void> {
    await this.events.getById(userId, eventId);
    await this.prisma.invitation.deleteMany({ where: { id: invitationId, eventId } });
  }
}
