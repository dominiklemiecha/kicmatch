import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { Event, Participant } from "@prisma/client";
import { randomBytes } from "crypto";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EmailService } from "../email/email.service";
import * as QRCode from "qrcode";
import { paymentConfirmationEmail, rsvpConfirmationEmail, ticketEmail } from "../email/templates";

async function ticketQrAttachment(ticketCode: string | null): Promise<{ filename: string; content: Buffer; cid: string; contentType: string }[]> {
  if (!ticketCode) return [];
  try {
    const buffer = await QRCode.toBuffer(ticketCode, { width: 360, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } });
    return [{ filename: "qr.png", content: buffer, cid: "ticket-qr", contentType: "image/png" }];
  } catch {
    return [];
  }
}
import type { RsvpInput } from "@kicmatch/shared";

function generateTicketCode(): string {
  const block = (): string => randomBytes(2).toString("hex").toUpperCase();
  return `KIC-${block()}-${block()}-${block()}`;
}

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService, private readonly email: EmailService) {}

  async getBySlug(slug: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        user: { select: { firstName: true, lastName: true, profileName: true } },
        form: true,
      },
    });
    if (!event) return null;
    if (event.status !== "PUBLISHED") return null;
    const participantCount = await this.prisma.participant.count({
      where: { eventId: event.id, status: { in: ["CONFIRMED", "PAID", "PENDING_PAYMENT"] } },
    });
    return {
      event,
      form: event.form ? { fields: event.form.fields, privacyRequired: event.form.privacyRequired } : { fields: [], privacyRequired: true },
      participantCount,
    };
  }

  async rsvp(slug: string, input: RsvpInput): Promise<{ participant: Participant; requiresPayment: boolean; event: Event }> {
    const event = await this.prisma.event.findUnique({ where: { slug } });
    if (!event || event.status !== "PUBLISHED") throw new NotFoundException("Evento non disponibile");
    if (event.rsvpDeadline && new Date(event.rsvpDeadline) < new Date()) {
      throw new BadRequestException("Le iscrizioni sono chiuse");
    }

    const currentCount = await this.prisma.participant.count({
      where: { eventId: event.id, status: { in: ["CONFIRMED", "PAID", "PENDING_PAYMENT"] } },
    });
    if (event.capacity !== null && currentCount >= event.capacity) {
      throw new BadRequestException("Posti esauriti");
    }
    const formRow = await this.prisma.eventForm.findUnique({ where: { eventId: event.id } });
    if (formRow?.privacyRequired && !input.privacyAccepted) {
      throw new BadRequestException("Devi accettare la privacy");
    }
    const existing = await this.prisma.participant.findFirst({
      where: { eventId: event.id, email: input.email.toLowerCase() },
    });
    if (existing) {
      // Allow retry if the previous attempt was abandoned at payment
      if (existing.status === "PENDING_PAYMENT") {
        const updated = await this.prisma.participant.update({
          where: { id: existing.id },
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone ?? null,
            formData: input.formData as never,
            privacyAcceptedAt: input.privacyAccepted ? new Date() : existing.privacyAcceptedAt,
          },
        });
        const requiresPayment = event.isPaid && event.priceCents !== null && event.priceCents > 0;
        return { participant: updated, requiresPayment, event };
      }
      throw new ConflictException("Sei già iscritto a questo evento");
    }
    let invitationId: string | null = null;
    if (input.invitationToken) {
      const inv = await this.prisma.invitation.findUnique({ where: { token: input.invitationToken } });
      // Only link to MANUAL/CSV invitations (1:1). LINK invitations are shared by many,
      // so we don't tie individual participants to them.
      if (inv && inv.eventId === event.id && inv.source !== "LINK") {
        const alreadyUsed = await this.prisma.participant.findUnique({ where: { invitationId: inv.id } });
        if (!alreadyUsed) invitationId = inv.id;
      }
    }
    const requiresPayment = event.isPaid && event.priceCents !== null && event.priceCents > 0;
    const status = requiresPayment ? "PENDING_PAYMENT" : "CONFIRMED";
    const ticketCode = requiresPayment ? null : generateTicketCode();

    const participant = await this.prisma.participant.create({
      data: {
        eventId: event.id,
        invitationId,
        email: input.email.toLowerCase(),
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone ?? null,
        formData: input.formData as never,
        privacyAcceptedAt: input.privacyAccepted ? new Date() : null,
        status,
        ticketCode,
      },
    });
    if (status === "CONFIRMED") {
      // Email 1: conferma iscrizione (senza QR)
      await this.email.send({
        to: participant.email,
        subject: `Iscrizione confermata - ${event.name}`,
        html: rsvpConfirmationEmail(event, { firstName: participant.firstName, ticketCode: participant.ticketCode }),
      });
      // Email 2: biglietto con QR
      if (participant.ticketCode) {
        const attachments = await ticketQrAttachment(participant.ticketCode);
        await this.email.send({
          to: participant.email,
          subject: `Il tuo biglietto - ${event.name}`,
          html: ticketEmail(event, { firstName: participant.firstName, ticketCode: participant.ticketCode }),
          attachments,
        });
      }
    }
    return { participant, requiresPayment, event };
  }

  async markPaid(
    participantId: string,
    payment: {
      stripeCheckoutId?: string | null;
      stripePaymentIntent?: string | null;
      amountCents: number;
      feeCents: number;
      currency: string;
    },
  ): Promise<void> {
    const ticketCode = generateTicketCode();
    await this.prisma.$transaction([
      this.prisma.participant.update({
        where: { id: participantId },
        data: { status: "PAID", ticketCode },
      }),
      this.prisma.payment.upsert({
        where: { participantId },
        update: {
          status: "SUCCEEDED",
          paidAt: new Date(),
          ...(payment.stripeCheckoutId && { stripeCheckoutId: payment.stripeCheckoutId }),
          ...(payment.stripePaymentIntent && { stripePaymentIntent: payment.stripePaymentIntent }),
        },
        create: {
          participantId,
          amountCents: payment.amountCents,
          feeCents: payment.feeCents,
          currency: payment.currency,
          status: "SUCCEEDED",
          paidAt: new Date(),
          stripeCheckoutId: payment.stripeCheckoutId ?? null,
          stripePaymentIntent: payment.stripePaymentIntent ?? null,
        },
      }),
    ]);
    const refreshed = await this.prisma.participant.findUnique({ where: { id: participantId }, include: { event: true } });
    if (refreshed) {
      // Email 1: conferma pagamento + info evento (senza QR)
      await this.email.send({
        to: refreshed.email,
        subject: `Pagamento ricevuto - ${refreshed.event.name}`,
        html: paymentConfirmationEmail(refreshed.event, { firstName: refreshed.firstName, ticketCode: refreshed.ticketCode }, payment.amountCents, payment.currency),
      });
      // Email 2: biglietto con QR
      if (refreshed.ticketCode) {
        const attachments = await ticketQrAttachment(refreshed.ticketCode);
        await this.email.send({
          to: refreshed.email,
          subject: `Il tuo biglietto - ${refreshed.event.name}`,
          html: ticketEmail(refreshed.event, { firstName: refreshed.firstName, ticketCode: refreshed.ticketCode }),
          attachments,
        });
      }
    }
  }

  async recordFailedPayment(participantId: string, reason: string): Promise<void> {
    await this.prisma.payment.updateMany({
      where: { participantId },
      data: { status: "FAILED", failureReason: reason },
    });
  }

  async createPendingPayment(
    participantId: string,
    amountCents: number,
    feeCents: number,
    currency: string,
    stripeCheckoutId: string,
  ): Promise<void> {
    await this.prisma.payment.upsert({
      where: { participantId },
      update: {
        amountCents,
        feeCents,
        currency,
        stripeCheckoutId,
        status: "PROCESSING",
      },
      create: {
        participantId,
        amountCents,
        feeCents,
        currency,
        stripeCheckoutId,
        status: "PROCESSING",
      },
    });
  }
}
