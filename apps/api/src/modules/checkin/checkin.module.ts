import { Module } from "@nestjs/common";
import { EventsModule } from "../events/events.module";
import { CheckinController } from "./checkin.controller";
import { CheckinService } from "./checkin.service";

@Module({
  imports: [EventsModule],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
