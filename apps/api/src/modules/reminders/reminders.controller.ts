import { Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { EventsService } from "../events/events.service";
import { RemindersService } from "./reminders.service";

@ApiTags("reminders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("events/:eventId")
export class RemindersController {
  constructor(
    private readonly reminders: RemindersService,
    private readonly events: EventsService,
  ) {}

  @Post("reminders/send")
  async send(@CurrentUser() user: JwtPayload, @Param("eventId") eventId: string): Promise<{ sent: number }> {
    await this.events.getById(user.sub, eventId);
    const sent = await this.reminders.runForEvent(eventId);
    return { sent };
  }
}
