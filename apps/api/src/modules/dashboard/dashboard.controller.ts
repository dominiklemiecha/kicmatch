import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";

@ApiTags("dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("overview")
  async overview(@CurrentUser() user: JwtPayload): Promise<{
    invitedCount: number;
    confirmedCount: number;
    paidCount: number;
    revenueCents: number;
    currency: string;
    enrollmentTrend: { date: string; v: number }[];
    statusBreakdown: { name: string; value: number; color: string }[];
    upcomingEvents: { id: string; name: string; startAt: string; locationName: string | null; locationType: string; capacity: number | null; participantCount: number }[];
    recentActivity: { type: string; title: string; subtitle: string; at: string }[];
  }> {
    const userEvents = await this.prisma.event.findMany({ where: { userId: user.sub } });
    const eventIds = userEvents.map((e) => e.id);
    if (eventIds.length === 0) {
      return {
        invitedCount: 0, confirmedCount: 0, paidCount: 0, revenueCents: 0, currency: "EUR",
        enrollmentTrend: this.emptyTrend(),
        statusBreakdown: [],
        upcomingEvents: [],
        recentActivity: [],
      };
    }
    const [invitedCount, participants, payments, upcoming] = await Promise.all([
      this.prisma.invitation.count({ where: { eventId: { in: eventIds }, email: { not: null } } }),
      this.prisma.participant.findMany({ where: { eventId: { in: eventIds } }, select: { status: true, createdAt: true, firstName: true, lastName: true, eventId: true } }),
      this.prisma.payment.findMany({ where: { participant: { eventId: { in: eventIds } }, status: "SUCCEEDED" }, select: { amountCents: true, currency: true, createdAt: true, participant: { select: { firstName: true, lastName: true, eventId: true } } } }),
      this.prisma.event.findMany({
        where: { userId: user.sub, status: "PUBLISHED", startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        take: 3,
      }),
    ]);
    const confirmedCount = participants.filter((p) => p.status === "CONFIRMED" || p.status === "PAID").length;
    const paidCount = participants.filter((p) => p.status === "PAID").length;
    const revenueCents = payments.reduce((acc, p) => acc + p.amountCents, 0);
    const currency = payments[0]?.currency ?? "EUR";

    const buckets = this.last7DaysBuckets();
    const counts = new Map<string, number>(buckets.map((b) => [b.key, 0]));
    for (const p of participants) {
      const k = p.createdAt.toISOString().slice(0, 10);
      if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const enrollmentTrend = buckets.map((b) => ({ date: b.label, v: counts.get(b.key) ?? 0 }));

    const statusBreakdown = [
      { name: "Confermati", value: participants.filter((p) => p.status === "CONFIRMED").length, color: "#7c3aed" },
      { name: "Pagati", value: paidCount, color: "#ec4899" },
      { name: "In attesa", value: participants.filter((p) => p.status === "PENDING_PAYMENT").length, color: "#fb923c" },
      { name: "Rifiutati", value: participants.filter((p) => p.status === "REJECTED" || p.status === "CANCELLED").length, color: "#94a3b8" },
    ];

    const eventNameById = new Map(userEvents.map((e) => [e.id, e.name]));
    const upcomingWithCounts = await Promise.all(upcoming.map(async (e) => ({
      id: e.id,
      name: e.name,
      startAt: e.startAt.toISOString(),
      locationName: e.locationName,
      locationType: e.locationType,
      capacity: e.capacity,
      participantCount: await this.prisma.participant.count({ where: { eventId: e.id, status: { in: ["CONFIRMED", "PAID"] } } }),
    })));

    const activity: { type: string; title: string; subtitle: string; at: string }[] = [];
    const sortedParticipants = [...participants].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    for (const p of sortedParticipants) {
      const evName = eventNameById.get(p.eventId) ?? "Evento";
      const label =
        p.status === "PAID" ? "Pagamento ricevuto da" :
        p.status === "CONFIRMED" ? "Nuova iscrizione" :
        p.status === "PENDING_PAYMENT" ? "In attesa pagamento" :
        null;
      if (!label) continue;
      activity.push({
        type: p.status,
        title: p.status === "CONFIRMED" ? `${label} a ${evName}` : `${label} ${p.firstName} ${p.lastName} · ${evName}`,
        subtitle: this.timeAgo(p.createdAt),
        at: p.createdAt.toISOString(),
      });
      if (activity.length >= 5) break;
    }

    return {
      invitedCount,
      confirmedCount,
      paidCount,
      revenueCents,
      currency,
      enrollmentTrend,
      statusBreakdown,
      upcomingEvents: upcomingWithCounts,
      recentActivity: activity,
    };
  }

  @Get("participants")
  async allParticipants(@CurrentUser() user: JwtPayload): Promise<unknown[]> {
    const events = await this.prisma.event.findMany({ where: { userId: user.sub }, select: { id: true, name: true } });
    const ids = events.map((e) => e.id);
    if (ids.length === 0) return [];
    const eventNameById = new Map(events.map((e) => [e.id, e.name]));
    const items = await this.prisma.participant.findMany({
      where: { eventId: { in: ids } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return items.map((p) => ({
      id: p.id,
      email: p.email,
      firstName: p.firstName,
      lastName: p.lastName,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      event: { id: p.eventId, name: eventNameById.get(p.eventId) ?? "" },
    }));
  }

  private last7DaysBuckets(): { key: string; label: string }[] {
    const months = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
    const arr: { key: string; label: string }[] = [];
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      arr.push({ key: d.toISOString().slice(0,10), label: `${d.getDate()} ${months[d.getMonth()]}` });
    }
    return arr;
  }

  private emptyTrend(): { date: string; v: number }[] {
    return this.last7DaysBuckets().map((b) => ({ date: b.label, v: 0 }));
  }

  private timeAgo(d: Date): string {
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return `${sec} sec fa`;
    if (sec < 3600) return `${Math.floor(sec/60)} min fa`;
    if (sec < 86400) return `${Math.floor(sec/3600)} ore fa`;
    return `${Math.floor(sec/86400)} giorni fa`;
  }
}
