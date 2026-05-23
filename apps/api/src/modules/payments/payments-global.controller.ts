import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";

interface GlobalPaymentItem {
  id: string;
  amountCents: number;
  feeCents: number;
  currency: string;
  status: string;
  paidAt: string | null;
  participantEmail: string;
  participantName: string;
  ticketCode: string | null;
}

interface EventPaymentsGroup {
  eventId: string;
  eventName: string;
  eventStartAt: string;
  totalCollectedCents: number;
  totalFeesCents: number;
  paymentsCount: number;
  payments: GlobalPaymentItem[];
}

@ApiTags("payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payments")
export class PaymentsGlobalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("by-event")
  async byEvent(@CurrentUser() user: JwtPayload): Promise<EventPaymentsGroup[]> {
    const events = await this.prisma.event.findMany({
      where: { userId: user.sub },
      orderBy: { startAt: "desc" },
    });
    const result: EventPaymentsGroup[] = [];
    for (const e of events) {
      const items = await this.prisma.payment.findMany({
        where: { participant: { eventId: e.id } },
        include: { participant: true },
        orderBy: { createdAt: "desc" },
      });
      const succeeded = items.filter((p) => p.status === "SUCCEEDED");
      const totalCollectedCents = succeeded.reduce((acc, p) => acc + p.amountCents, 0);
      const totalFeesCents = succeeded.reduce((acc, p) => acc + p.feeCents, 0);
      if (items.length === 0) continue;
      result.push({
        eventId: e.id,
        eventName: e.name,
        eventStartAt: e.startAt.toISOString(),
        totalCollectedCents,
        totalFeesCents,
        paymentsCount: items.length,
        payments: items.map((p) => ({
          id: p.id,
          amountCents: p.amountCents,
          feeCents: p.feeCents,
          currency: p.currency,
          status: p.status,
          paidAt: p.paidAt ? p.paidAt.toISOString() : null,
          participantEmail: p.participant.email,
          participantName: `${p.participant.firstName} ${p.participant.lastName}`,
          ticketCode: p.participant.ticketCode,
        })),
      });
    }
    return result;
  }
}
