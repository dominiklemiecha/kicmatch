import { Module } from "@nestjs/common";
import { StripeModule } from "../stripe/stripe.module";
import { PublicController } from "./public.controller";
import { PublicService } from "./public.service";

@Module({
  imports: [StripeModule],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
