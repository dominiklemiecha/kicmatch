import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CheckinService } from "./checkin.service";

const scanSchema = z.object({ ticketCode: z.string().min(1) });

@ApiTags("checkin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("events/:eventId")
export class CheckinController {
  constructor(private readonly checkin: CheckinService) {}

  @Post("checkin/scan")
  async scan(
    @CurrentUser() user: JwtPayload,
    @Param("eventId") eventId: string,
    @Body(new ZodValidationPipe(scanSchema)) body: { ticketCode: string },
  ): Promise<{ participantId: string; firstName: string; lastName: string; email: string; ticketCode: string | null; alreadyCheckedIn: boolean; checkedInAt: string | null }> {
    const { participant, alreadyCheckedIn } = await this.checkin.scan(user.sub, eventId, body.ticketCode);
    return {
      participantId: participant.id,
      firstName: participant.firstName,
      lastName: participant.lastName,
      email: participant.email,
      ticketCode: participant.ticketCode,
      alreadyCheckedIn,
      checkedInAt: participant.qrCheckedInAt ? participant.qrCheckedInAt.toISOString() : null,
    };
  }

  @Get("checkin/stats")
  async stats(@CurrentUser() user: JwtPayload, @Param("eventId") eventId: string): Promise<{ total: number; checkedIn: number }> {
    return this.checkin.stats(user.sub, eventId);
  }
}
