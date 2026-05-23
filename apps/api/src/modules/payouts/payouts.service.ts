import { BadRequestException, Injectable } from "@nestjs/common";
import type { PayoutRequest } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { PayoutRequestInput } from "@kicmatch/shared";

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async balanceFor(userId: string): Promise<{ totalCollectedCents: number; totalFeesCents: number; totalPaidOutCents: number; pendingRequestCents: number; availableCents: number; currency: string }> {
    const successfulPayments = await this.prisma.payment.findMany({
      where: { status: "SUCCEEDED", participant: { event: { userId } } },
      select: { amountCents: true, feeCents: true, currency: true },
    });
    const payouts = await this.prisma.payoutRequest.findMany({
      where: { userId },
      select: { amountCents: true, status: true },
    });
    const totalCollectedCents = successfulPayments.reduce((acc, p) => acc + p.amountCents, 0);
    const totalFeesCents = successfulPayments.reduce((acc, p) => acc + p.feeCents, 0);
    const totalPaidOutCents = payouts.filter((p) => p.status === "PAID").reduce((acc, p) => acc + p.amountCents, 0);
    const pendingRequestCents = payouts.filter((p) => p.status === "PENDING" || p.status === "APPROVED").reduce((acc, p) => acc + p.amountCents, 0);
    const availableCents = totalCollectedCents - totalFeesCents - totalPaidOutCents - pendingRequestCents;
    return {
      totalCollectedCents,
      totalFeesCents,
      totalPaidOutCents,
      pendingRequestCents,
      availableCents: Math.max(0, availableCents),
      currency: successfulPayments[0]?.currency ?? "EUR",
    };
  }

  async createRequest(userId: string, input: PayoutRequestInput): Promise<PayoutRequest> {
    const balance = await this.balanceFor(userId);
    if (input.amountCents > balance.availableCents) {
      throw new BadRequestException(`Importo richiesto (${input.amountCents}c) supera il saldo disponibile (${balance.availableCents}c)`);
    }
    // Salva IBAN come default sul profilo
    await this.prisma.user.update({ where: { id: userId }, data: { ibanDefault: input.iban, ibanHolderDefault: input.ibanHolder } });
    return this.prisma.payoutRequest.create({
      data: {
        userId,
        amountCents: input.amountCents,
        currency: balance.currency,
        iban: input.iban,
        ibanHolder: input.ibanHolder,
        notes: input.notes ?? null,
      },
    });
  }

  async listMine(userId: string): Promise<PayoutRequest[]> {
    return this.prisma.payoutRequest.findMany({ where: { userId }, orderBy: { requestedAt: "desc" } });
  }
}
