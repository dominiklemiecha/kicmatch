import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { EventsModule } from "../events/events.module";
import { RemindersController } from "./reminders.controller";
import { RemindersService } from "./reminders.service";

@Module({
  imports: [ScheduleModule.forRoot(), EventsModule],
  controllers: [RemindersController],
  providers: [RemindersService],
})
export class RemindersModule {}
