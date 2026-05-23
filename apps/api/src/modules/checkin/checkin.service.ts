import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Participant } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EventsService } from "../events/events.service";

@Injectable()
export class CheckinService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventsService) {}

  async scan(userId: string, eventId: string, ticketCode: string): Promise<{ participant: Participant; alreadyCheckedIn: boolean }> {
    await this.events.getById(userId, eventId);
    const trimmed = ticketCode.trim();
    if (!trimmed) throw new BadRequestException("Codice biglietto vuoto");
    const participant = await this.prisma.participant.findFirst({
      where: { eventId, ticketCode: trimmed },
    });
    if (!participant) throw new NotFoundException("Biglietto non valido per questo evento");
    if (participant.status !== "CONFIRMED" && participant.status !== "PAID") {
      throw new BadRequestException(`Stato non valido: ${participant.status}`);
    }
    if (participant.qrCheckedInAt) {
      return { participant, alreadyCheckedIn: true };
    }
    const updated = await this.prisma.participant.update({
      where: { id: participant.id },
      data: { qrCheckedInAt: new Date() },
    });
    return { participant: updated, alreadyCheckedIn: false };
  }

  async stats(userId: string, eventId: string): Promise<{ total: number; checkedIn: number }> {
    await this.events.getById(userId, eventId);
    const [total, checkedIn] = await Promise.all([
      this.prisma.participant.count({ where: { eventId, status: { in: ["CONFIRMED", "PAID"] } } }),
      this.prisma.participant.count({ where: { eventId, qrCheckedInAt: { not: null } } }),
    ]);
    return { total, checkedIn };
  }
}
