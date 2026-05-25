import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  createEventSchema,
  updateEventSchema,
  eventFormSchema,
  eventFormResponseSchema,
  type CreateEventInput,
  type EventResponse,
  type UpdateEventInput,
  type EventFormInput,
  type EventFormResponse,
} from "@kicmatch/shared";
import type { Event } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { EventsService } from "./events.service";

function toResponse(e: Event): EventResponse {
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    description: e.description,
    coverImageUrl: e.coverImageUrl,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt ? e.endAt.toISOString() : null,
    locationType: e.locationType,
    locationName: e.locationName,
    locationAddress: e.locationAddress,
    onlineUrl: e.onlineUrl,
    capacity: e.capacity,
    rsvpDeadline: e.rsvpDeadline ? e.rsvpDeadline.toISOString() : null,
    isPaid: e.isPaid,
    priceCents: e.priceCents,
    currency: e.currency,
    paymentMethods: e.paymentMethods,
    status: e.status,
    publishedAt: e.publishedAt ? e.publishedAt.toISOString() : null,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

@ApiTags("events")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("events")
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload): Promise<EventResponse[]> {
    const items = await this.events.list(user.sub);
    return items.map(toResponse);
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createEventSchema)) body: CreateEventInput,
  ): Promise<EventResponse> {
    const created = await this.events.create(user.sub, body);
    return toResponse(created);
  }

  @Get(":id")
  async getOne(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<EventResponse> {
    const ev = await this.events.getById(user.sub, id);
    return toResponse(ev);
  }

  @Patch(":id")
  async update(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateEventSchema)) body: UpdateEventInput,
  ): Promise<EventResponse> {
    const updated = await this.events.update(user.sub, id, body);
    return toResponse(updated);
  }

  @Post(":id/publish")
  @HttpCode(200)
  async publish(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<EventResponse> {
    const ev = await this.events.publish(user.sub, id);
    return toResponse(ev);
  }

  @Post(":id/close")
  @HttpCode(200)
  async close(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<EventResponse> {
    const ev = await this.events.close(user.sub, id);
    return toResponse(ev);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<void> {
    await this.events.remove(user.sub, id);
  }

  @Get(":id/form")
  async getForm(@CurrentUser() user: JwtPayload, @Param("id") id: string): Promise<EventFormResponse> {
    const form = await this.events.getForm(user.sub, id);
    if (!form) {
      return {
        id: "",
        eventId: id,
        fields: [],
        privacyRequired: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return eventFormResponseSchema.parse({
      id: form.id,
      eventId: form.eventId,
      fields: form.fields ?? [],
      privacyRequired: form.privacyRequired,
      updatedAt: form.updatedAt.toISOString(),
    });
  }

  @Put(":id/form")
  async putForm(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(eventFormSchema)) body: EventFormInput,
  ): Promise<EventFormResponse> {
    const form = await this.events.upsertForm(user.sub, id, body);
    return eventFormResponseSchema.parse({
      id: form.id,
      eventId: form.eventId,
      fields: form.fields ?? [],
      privacyRequired: form.privacyRequired,
      updatedAt: form.updatedAt.toISOString(),
    });
  }
}
