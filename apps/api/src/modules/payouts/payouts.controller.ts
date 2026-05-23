import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  payoutRequestInputSchema,
  type PayoutBalance,
  type PayoutRequestInput,
  type PayoutResponse,
} from "@kicmatch/shared";
import type { PayoutRequest } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { PayoutsService } from "./payouts.service";

function toResponse(p: PayoutRequest): PayoutResponse {
  return {
    id: p.id,
    amountCents: p.amountCents,
    currency: p.currency,
    iban: p.iban,
    ibanHolder: p.ibanHolder,
    status: p.status,
    notes: p.notes,
    adminNotes: p.adminNotes,
    requestedAt: p.requestedAt.toISOString(),
    processedAt: p.processedAt ? p.processedAt.toISOString() : null,
  };
}

@ApiTags("payouts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payouts")
export class PayoutsController {
  constructor(private readonly payouts: PayoutsService) {}

  @Get("balance")
  async balance(@CurrentUser() user: JwtPayload): Promise<PayoutBalance> {
    return this.payouts.balanceFor(user.sub);
  }

  @Get("requests")
  async listMine(@CurrentUser() user: JwtPayload): Promise<PayoutResponse[]> {
    const items = await this.payouts.listMine(user.sub);
    return items.map(toResponse);
  }

  @Post("requests")
  async create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(payoutRequestInputSchema)) body: PayoutRequestInput,
  ): Promise<PayoutResponse> {
    const created = await this.payouts.createRequest(user.sub, body);
    return toResponse(created);
  }
}
