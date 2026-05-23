import { Body, Controller, Get, Param, Patch, Query, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  participantStatusEnum,
  updateParticipantStatusSchema,
  type ParticipantListItem,
  type ParticipantStatus,
  type UpdateParticipantStatusInput,
} from "@kicmatch/shared";
import type { Participant } from "@prisma/client";
import type { Response } from "express";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { ParticipantsService } from "./participants.service";

function toResponse(p: Participant): ParticipantListItem {
  return {
    id: p.id,
    eventId: p.eventId,
    email: p.email,
    firstName: p.firstName,
    lastName: p.lastName,
    phone: p.phone,
    status: p.status,
    ticketCode: p.ticketCode,
    qrCheckedInAt: p.qrCheckedInAt ? p.qrCheckedInAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    formData: p.formData,
  };
}

@ApiTags("participants")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ParticipantsController {
  constructor(private readonly participants: ParticipantsService) {}

  @Get("events/:eventId/participants/export")
  async exportCsv(@CurrentUser() user: JwtPayload, @Param("eventId") eventId: string, @Res() res: Response): Promise<void> {
    const items = await this.participants.listForEvent(user.sub, eventId, {});
    const rows = [
      ["Nome", "Cognome", "Email", "Telefono", "Stato", "Ticket", "Check-in", "Iscrizione"],
      ...items.map((p) => [
        p.firstName, p.lastName, p.email, p.phone ?? "",
        p.status, p.ticketCode ?? "",
        p.qrCheckedInAt ? p.qrCheckedInAt.toISOString() : "",
        p.createdAt.toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="partecipanti-${eventId}.csv"`);
    res.send("﻿" + csv);
  }

  @Get("events/:eventId/participants")
  async list(
    @CurrentUser() user: JwtPayload,
    @Param("eventId") eventId: string,
    @Query("status") status?: string,
    @Query("q") q?: string,
  ): Promise<ParticipantListItem[]> {
    const parsedStatus = status && participantStatusEnum.safeParse(status).success ? (status as ParticipantStatus) : undefined;
    const items = await this.participants.listForEvent(user.sub, eventId, { status: parsedStatus, q });
    return items.map(toResponse);
  }

  @Patch("participants/:id/status")
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateParticipantStatusSchema)) body: UpdateParticipantStatusInput,
  ): Promise<ParticipantListItem> {
    const updated = await this.participants.updateStatus(user.sub, id, body);
    return toResponse(updated);
  }
}
