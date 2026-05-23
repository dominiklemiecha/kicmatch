import { createRouter } from "@tanstack/react-router";
import { Route as RootRoute } from "./routes/__root";
import { Route as AdminDashboardRoute } from "./routes/admin-dashboard";
import { Route as AdminPayoutsRoute } from "./routes/admin-payouts";
import { Route as AdminUserDetailRoute } from "./routes/admin-user-detail";
import { Route as AdminUsersRoute } from "./routes/admin-users";
import { Route as CheckinGlobalRoute } from "./routes/checkin-global";
import { Route as CookieRoute } from "./routes/cookie";
import { Route as DashboardRoute } from "./routes/dashboard";
import { Route as EventBigliettiRoute } from "./routes/event-biglietti";
import { Route as EventDetailRoute } from "./routes/event-detail";
import { Route as EventInvitiRoute } from "./routes/event-inviti";
import { Route as EventModuloRoute } from "./routes/event-modulo";
import { Route as EventNewRoute } from "./routes/event-new";
import { Route as EventPubblicatoRoute } from "./routes/event-pubblicato";
import { Route as EventRiepilogoRoute } from "./routes/event-riepilogo";
import { Route as EventsListRoute } from "./routes/events-list";
import { Route as ForgotPasswordRoute } from "./routes/forgot-password";
import { Route as FunzionalitaRoute } from "./routes/funzionalita";
import { Route as FormsGlobalRoute } from "./routes/forms-global";
import { Route as ImportsGlobalRoute } from "./routes/imports-global";
import { Route as IndexRoute } from "./routes/index";
import { Route as InvitationsGlobalRoute } from "./routes/invitations-global";
import { Route as ParticipantsGlobalRoute } from "./routes/participants-global";
import { Route as PaymentsRoute } from "./routes/payments";
import { Route as PayoutsRoute } from "./routes/payouts";
import { Route as PricingRoute } from "./routes/pricing";
import { Route as PrivacyRoute } from "./routes/privacy";
import { Route as TerminiRoute } from "./routes/termini";
import { Route as LoginRoute } from "./routes/login";
import { Route as PublicEventRoute } from "./routes/public-event";
import { Route as PublicEventCancelledRoute } from "./routes/public-event-cancelled";
import { Route as PublicEventSuccessRoute } from "./routes/public-event-success";
import { Route as RegisterRoute } from "./routes/register";
import { Route as RegisterAccountRoute } from "./routes/register-account";
import { Route as RegisterDoneRoute } from "./routes/register-done";
import { Route as RegisterKicmatchRoute } from "./routes/register-kicmatch";
import { Route as RegisterOnboardingRoute } from "./routes/register-onboarding";
import { Route as RegisterPaymentRoute } from "./routes/register-payment";
import { Route as RegisterPlanRoute } from "./routes/register-plan";
import { Route as RegisterProfileRoute } from "./routes/register-profile";
import { Route as RegisterReviewRoute } from "./routes/register-review";
import { Route as RegisterStripeRoute } from "./routes/register-stripe";
import { Route as SettingsRoute } from "./routes/settings";

const routeTree = RootRoute.addChildren([
  IndexRoute,
  PricingRoute,
  FunzionalitaRoute,
  PrivacyRoute,
  TerminiRoute,
  CookieRoute,
  DashboardRoute,
  EventsListRoute,
  EventNewRoute,
  EventInvitiRoute,
  EventModuloRoute,
  EventBigliettiRoute,
  EventRiepilogoRoute,
  EventPubblicatoRoute,
  EventDetailRoute,
  PaymentsRoute,
  PayoutsRoute,
  AdminDashboardRoute,
  AdminUsersRoute,
  AdminUserDetailRoute,
  AdminPayoutsRoute,
  ParticipantsGlobalRoute,
  InvitationsGlobalRoute,
  FormsGlobalRoute,
  CheckinGlobalRoute,
  ImportsGlobalRoute,
  SettingsRoute,
  PublicEventRoute,
  PublicEventSuccessRoute,
  PublicEventCancelledRoute,
  LoginRoute,
  RegisterRoute,
  RegisterPlanRoute,
  RegisterAccountRoute,
  RegisterProfileRoute,
  RegisterPaymentRoute,
  RegisterStripeRoute,
  RegisterKicmatchRoute,
  RegisterReviewRoute,
  RegisterDoneRoute,
  RegisterOnboardingRoute,
  ForgotPasswordRoute,
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
