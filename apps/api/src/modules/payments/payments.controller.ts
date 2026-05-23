import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { EventPaymentSummary, PaymentListItem } from "@kicmatch/shared";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { PaymentsService } from "./payments.service";

@ApiTags("payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("events/:eventId")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get("payments")
  async list(
    @CurrentUser() user: JwtPayload,
    @Param("eventId") eventId: string,
  ): Promise<PaymentListItem[]> {
    const items = await this.payments.listForEvent(user.sub, eventId);
    return items.map((p) => ({
      id: p.id,
      amountCents: p.amountCents,
      feeCents: p.feeCents,
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      participant: {
        id: p.participant.id,
        email: p.participant.email,
        firstName: p.participant.firstName,
        lastName: p.participant.lastName,
        ticketCode: p.participant.ticketCode,
      },
      event: {
        id: p.participant.event.id,
        name: p.participant.event.name,
      },
    }));
  }

  @Get("payments/summary")
  async summary(
    @CurrentUser() user: JwtPayload,
    @Param("eventId") eventId: string,
  ): Promise<EventPaymentSummary> {
    return this.payments.summaryForEvent(user.sub, eventId);
  }
}
