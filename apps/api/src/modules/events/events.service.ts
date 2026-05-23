import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { Event, Prisma } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { CreateEventInput, UpdateEventInput } from "@kicmatch/shared";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<Event[]> {
    return this.prisma.event.findMany({
      where: { userId },
      orderBy: [{ createdAt: "desc" }],
    });
  }

  async getById(userId: string, id: string): Promise<Event> {
    const ev = await this.prisma.event.findUnique({ where: { id } });
    if (!ev) throw new NotFoundException("Evento non trovato");
    if (ev.userId !== userId) throw new ForbiddenException("Accesso negato");
    return ev;
  }

  async create(userId: string, input: CreateEventInput): Promise<Event> {
    const base = slugify(input.name) || "evento";
    const slug = `${base}-${Date.now().toString(36)}`;
    const data: Prisma.EventCreateInput = {
      slug,
      name: input.name,
      description: input.description ?? null,
      coverImageUrl: input.coverImageUrl ?? null,
      startAt: new Date(input.startAt),
      endAt: input.endAt ? new Date(input.endAt) : null,
      locationType: input.locationType,
      locationName: input.locationName ?? null,
      locationAddress: input.locationAddress ?? null,
      onlineUrl: input.onlineUrl ?? null,
      user: { connect: { id: userId } },
    };
    return this.prisma.event.create({ data });
  }

  async update(userId: string, id: string, input: UpdateEventInput): Promise<Event> {
    await this.getById(userId, id);
    const data: Prisma.EventUpdateInput = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.coverImageUrl !== undefined && { coverImageUrl: input.coverImageUrl }),
      ...(input.startAt !== undefined && { startAt: new Date(input.startAt) }),
      ...(input.endAt !== undefined && { endAt: input.endAt ? new Date(input.endAt) : null }),
      ...(input.locationType !== undefined && { locationType: input.locationType }),
      ...(input.locationName !== undefined && { locationName: input.locationName }),
      ...(input.locationAddress !== undefined && { locationAddress: input.locationAddress }),
      ...(input.onlineUrl !== undefined && { onlineUrl: input.onlineUrl }),
      ...(input.capacity !== undefined && { capacity: input.capacity }),
      ...(input.rsvpDeadline !== undefined && { rsvpDeadline: input.rsvpDeadline ? new Date(input.rsvpDeadline) : null }),
      ...(input.isPaid !== undefined && { isPaid: input.isPaid }),
      ...(input.priceCents !== undefined && { priceCents: input.priceCents }),
      ...(input.currency !== undefined && { currency: input.currency }),
      ...(input.paymentMethods !== undefined && { paymentMethods: input.paymentMethods as Prisma.InputJsonValue }),
    };
    return this.prisma.event.update({ where: { id }, data });
  }

  async publish(userId: string, id: string): Promise<Event> {
    const ev = await this.getById(userId, id);
    if (ev.status !== "DRAFT") throw new BadRequestException("Solo eventi in bozza possono essere pubblicati");
    if (ev.isPaid && (ev.priceCents === null || ev.priceCents <= 0)) {
      throw new BadRequestException("Prezzo richiesto per evento a pagamento");
    }
    return this.prisma.event.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }

  async getForm(userId: string, eventId: string): Promise<{ id: string; eventId: string; fields: unknown; privacyRequired: boolean; updatedAt: Date } | null> {
    await this.getById(userId, eventId);
    const form = await this.prisma.eventForm.findUnique({ where: { eventId } });
    return form;
  }

  async upsertForm(userId: string, eventId: string, input: { fields: unknown; privacyRequired: boolean }): Promise<{ id: string; eventId: string; fields: unknown; privacyRequired: boolean; updatedAt: Date }> {
    await this.getById(userId, eventId);
    return this.prisma.eventForm.upsert({
      where: { eventId },
      update: { fields: input.fields as never, privacyRequired: input.privacyRequired },
      create: { eventId, fields: input.fields as never, privacyRequired: input.privacyRequired },
    });
  }
}
