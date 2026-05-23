import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { validateEnv } from "./config/env.schema";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CheckinModule } from "./modules/checkin/checkin.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { EmailModule } from "./modules/email/email.module";
import { EventsModule } from "./modules/events/events.module";
import { HealthModule } from "./modules/health/health.module";
import { InvitationsModule } from "./modules/invitations/invitations.module";
import { ParticipantsModule } from "./modules/participants/participants.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PayoutsModule } from "./modules/payouts/payouts.module";
import { PublicModule } from "./modules/public/public.module";
import { RemindersModule } from "./modules/reminders/reminders.module";
import { StorageModule } from "./modules/storage/storage.module";
import { StripeModule } from "./modules/stripe/stripe.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    AdminModule,
    AuthModule,
    CheckinModule,
    DashboardModule,
    EmailModule,
    EventsModule,
    HealthModule,
    InvitationsModule,
    ParticipantsModule,
    PaymentsModule,
    PayoutsModule,
    PublicModule,
    RemindersModule,
    StorageModule,
    StripeModule,
  ],
})
export class AppModule {}
