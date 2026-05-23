import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Participant } from "@prisma/client";
import type { ParticipantStatus, UpdateParticipantStatusInput } from "@kicmatch/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EventsService } from "../events/events.service";

@Injectable()
export class ParticipantsService {
  constructor(private readonly prisma: PrismaService, private readonly events: EventsService) {}

  async listForEvent(userId: string, eventId: string, filter: { status?: ParticipantStatus; q?: string }): Promise<Participant[]> {
    await this.events.getById(userId, eventId);
    return this.prisma.participant.findMany({
      where: {
        eventId,
        ...(filter.status && { status: filter.status }),
        ...(filter.q && {
          OR: [
            { email: { contains: filter.q, mode: "insensitive" } },
            { firstName: { contains: filter.q, mode: "insensitive" } },
            { lastName: { contains: filter.q, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(userId: string, participantId: string, input: UpdateParticipantStatusInput): Promise<Participant> {
    const participant = await this.prisma.participant.findUnique({ where: { id: participantId } });
    if (!participant) throw new NotFoundException("Partecipante non trovato");
    const ev = await this.prisma.event.findUnique({ where: { id: participant.eventId } });
    if (!ev || ev.userId !== userId) throw new ForbiddenException("Accesso negato");
    return this.prisma.participant.update({
      where: { id: participantId },
      data: {
        status: input.status,
        rejectedReason: input.rejectedReason ?? null,
      },
    });
  }
}
