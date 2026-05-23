import { Injectable, NotFoundException } from "@nestjs/common";
import type { PayoutRequest } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(): Promise<{ users: number; events: number; participants: number; revenueCents: number; feesCents: number; pendingPayoutCents: number; pendingPayoutCount: number }> {
    const [users, events, participants, payments, pendingPayouts] = await Promise.all([
      this.prisma.user.count({ where: { role: "ORGANIZER" } }),
      this.prisma.event.count(),
      this.prisma.participant.count(),
      this.prisma.payment.findMany({ where: { status: "SUCCEEDED" }, select: { amountCents: true, feeCents: true } }),
      this.prisma.payoutRequest.findMany({ where: { status: { in: ["PENDING", "APPROVED"] } }, select: { amountCents: true } }),
    ]);
    return {
      users,
      events,
      participants,
      revenueCents: payments.reduce((acc, p) => acc + p.amountCents, 0),
      feesCents: payments.reduce((acc, p) => acc + p.feeCents, 0),
      pendingPayoutCents: pendingPayouts.reduce((acc, p) => acc + p.amountCents, 0),
      pendingPayoutCount: pendingPayouts.length,
    };
  }

  async listUsers(): Promise<unknown[]> {
    const users = await this.prisma.user.findMany({
      where: { role: "ORGANIZER" },
      orderBy: { createdAt: "desc" },
    });
    return Promise.all(users.map(async (u) => {
      const [eventsCount, paymentsAgg, payouts] = await Promise.all([
        this.prisma.event.count({ where: { userId: u.id } }),
        this.prisma.payment.findMany({ where: { status: "SUCCEEDED", participant: { event: { userId: u.id } } }, select: { amountCents: true, feeCents: true } }),
        this.prisma.payoutRequest.findMany({ where: { userId: u.id }, select: { requestedAt: true }, orderBy: { requestedAt: "desc" } }),
      ]);
      const revenueCents = paymentsAgg.reduce((acc, p) => acc + p.amountCents, 0);
      const feesCents = paymentsAgg.reduce((acc, p) => acc + p.feeCents, 0);
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        profileType: u.profileType,
        plan: u.plan,
        createdAt: u.createdAt.toISOString(),
        subscriptionStartAt: u.subscriptionStartAt ? u.subscriptionStartAt.toISOString() : null,
        subscriptionEndAt: u.subscriptionEndAt ? u.subscriptionEndAt.toISOString() : null,
        isBlocked: u.isBlocked,
        blockedAt: u.blockedAt ? u.blockedAt.toISOString() : null,
        eventsCount,
        revenueCents,
        feesCents,
        payoutCount: payouts.length,
        lastPayoutAt: payouts[0]?.requestedAt.toISOString() ?? null,
      };
    }));
  }

  async userDetail(userId: string): Promise<unknown> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    const [events, payouts, paymentsAgg] = await Promise.all([
      this.prisma.event.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      this.prisma.payoutRequest.findMany({ where: { userId }, orderBy: { requestedAt: "desc" } }),
      this.prisma.payment.findMany({ where: { status: "SUCCEEDED", participant: { event: { userId } } }, select: { amountCents: true, feeCents: true, currency: true } }),
    ]);
    const totalCollectedCents = paymentsAgg.reduce((acc, p) => acc + p.amountCents, 0);
    const totalFeesCents = paymentsAgg.reduce((acc, p) => acc + p.feeCents, 0);
    const totalPaidOutCents = payouts.filter((p) => p.status === "PAID").reduce((acc, p) => acc + p.amountCents, 0);
    let avgIntervalDays: number | null = null;
    if (payouts.length >= 2) {
      const sorted = [...payouts].sort((a, b) => a.requestedAt.getTime() - b.requestedAt.getTime());
      let total = 0;
      for (let i = 1; i < sorted.length; i++) {
        total += (sorted[i].requestedAt.getTime() - sorted[i - 1].requestedAt.getTime()) / (1000 * 60 * 60 * 24);
      }
      avgIntervalDays = Math.round(total / (sorted.length - 1));
    }
    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileType: user.profileType,
        plan: user.plan,
        ibanDefault: user.ibanDefault,
        ibanHolderDefault: user.ibanHolderDefault,
        createdAt: user.createdAt.toISOString(),
        subscriptionStartAt: user.subscriptionStartAt ? user.subscriptionStartAt.toISOString() : null,
        subscriptionEndAt: user.subscriptionEndAt ? user.subscriptionEndAt.toISOString() : null,
        isBlocked: user.isBlocked,
        blockedAt: user.blockedAt ? user.blockedAt.toISOString() : null,
        blockedReason: user.blockedReason,
      },
      payoutStats: {
        count: payouts.length,
        firstAt: payouts.length > 0 ? payouts[payouts.length - 1].requestedAt.toISOString() : null,
        lastAt: payouts.length > 0 ? payouts[0].requestedAt.toISOString() : null,
        avgIntervalDays,
      },
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        status: e.status,
        startAt: e.startAt.toISOString(),
        isPaid: e.isPaid,
        priceCents: e.priceCents,
        currency: e.currency,
      })),
      payouts: payouts.map((p) => ({
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
      })),
      financials: {
        totalCollectedCents,
        totalFeesCents,
        totalPaidOutCents,
        availableCents: Math.max(0, totalCollectedCents - totalFeesCents - totalPaidOutCents),
      },
    };
  }

  async listPayouts(filter?: "PENDING" | "PAID" | "REJECTED"): Promise<unknown[]> {
    const items = await this.prisma.payoutRequest.findMany({
      where: filter ? { status: filter } : undefined,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { requestedAt: "desc" },
    });
    return items.map((p) => ({
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
      user: p.user,
    }));
  }

  async markPayout(payoutId: string, status: "PAID" | "REJECTED", adminNotes?: string): Promise<PayoutRequest> {
    return this.prisma.payoutRequest.update({
      where: { id: payoutId },
      data: { status, processedAt: new Date(), adminNotes: adminNotes ?? null },
    });
  }

  async setUserBlocked(userId: string, blocked: boolean, reason?: string): Promise<unknown> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: blocked,
        blockedAt: blocked ? new Date() : null,
        blockedReason: blocked ? (reason ?? null) : null,
      },
      select: { id: true, isBlocked: true, blockedAt: true, blockedReason: true },
    });
  }

  async updateSubscription(userId: string, body: { subscriptionStartAt?: string | null; subscriptionEndAt?: string | null }): Promise<unknown> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    const data: { subscriptionStartAt?: Date | null; subscriptionEndAt?: Date | null } = {};
    if (body.subscriptionStartAt !== undefined) data.subscriptionStartAt = body.subscriptionStartAt ? new Date(body.subscriptionStartAt) : null;
    if (body.subscriptionEndAt !== undefined) data.subscriptionEndAt = body.subscriptionEndAt ? new Date(body.subscriptionEndAt) : null;
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, subscriptionStartAt: true, subscriptionEndAt: true },
    });
  }
}
