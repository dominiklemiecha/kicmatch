import { Module } from "@nestjs/common";
import { EventsModule } from "../events/events.module";
import { PaymentsController } from "./payments.controller";
import { PaymentsGlobalController } from "./payments-global.controller";
import { PaymentsService } from "./payments.service";

@Module({
  imports: [EventsModule],
  controllers: [PaymentsController, PaymentsGlobalController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
