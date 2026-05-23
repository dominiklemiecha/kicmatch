import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  createInvitationsSchema,
  type CreateInvitationsInput,
  type InvitationResponse,
} from "@kicmatch/shared";
import type { Invitation } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { InvitationsService } from "./invitations.service";

function toResponse(i: Invitation): InvitationResponse {
  return {
    id: i.id,
    eventId: i.eventId,
    email: i.email,
    token: i.token,
    source: i.source,
    sentAt: i.sentAt ? i.sentAt.toISOString() : null,
    openedAt: i.openedAt ? i.openedAt.toISOString() : null,
    createdAt: i.createdAt.toISOString(),
  };
}

@ApiTags("invitations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("events/:eventId/invitations")
export class InvitationsController {
  constructor(private readonly invites: InvitationsService) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload, @Param("eventId") eventId: string): Promise<InvitationResponse[]> {
    const items = await this.invites.listForEvent(user.sub, eventId);
    return items.map(toResponse);
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Param("eventId") eventId: string,
    @Body(new ZodValidationPipe(createInvitationsSchema)) body: CreateInvitationsInput,
  ): Promise<InvitationResponse[]> {
    const items = await this.invites.createBulk(user.sub, eventId, body);
    return items.map(toResponse);
  }

  @Post(":invitationId/resend")
  async resend(
    @CurrentUser() user: JwtPayload,
    @Param("eventId") eventId: string,
    @Param("invitationId") invitationId: string,
  ): Promise<{ ok: true }> {
    await this.invites.resend(user.sub, eventId, invitationId);
    return { ok: true };
  }

  @Delete(":invitationId")
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param("eventId") eventId: string,
    @Param("invitationId") invitationId: string,
  ): Promise<{ ok: true }> {
    await this.invites.remove(user.sub, eventId, invitationId);
    return { ok: true };
  }
}
