import { Injectable } from "@nestjs/common";
import type { Event, Participant, Payment } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EventsService } from "../events/events.service";

type PaymentWithRelations = Payment & {
  participant: Participant & { event: Event };
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async listForEvent(userId: string, eventId: string): Promise<PaymentWithRelations[]> {
    await this.events.getById(userId, eventId);
    return this.prisma.payment.findMany({
      where: { participant: { eventId } },
      include: { participant: { include: { event: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async summaryForEvent(
    userId: string,
    eventId: string,
  ): Promise<{
    totalCollectedCents: number;
    totalFeesCents: number;
    payoutDueCents: number;
    currency: string;
    successfulCount: number;
    pendingCount: number;
  }> {
    const event = await this.events.getById(userId, eventId);
    const payments = await this.prisma.payment.findMany({
      where: { participant: { eventId } },
    });
    const succeeded = payments.filter((p) => p.status === "SUCCEEDED");
    const pending = payments.filter((p) => p.status === "PROCESSING" || p.status === "PENDING");
    const totalCollectedCents = succeeded.reduce((acc, p) => acc + p.amountCents, 0);
    const totalFeesCents = succeeded.reduce((acc, p) => acc + p.feeCents, 0);
    return {
      totalCollectedCents,
      totalFeesCents,
      payoutDueCents: totalCollectedCents - totalFeesCents,
      currency: event.currency,
      successfulCount: succeeded.length,
      pendingCount: pending.length,
    };
  }
}
