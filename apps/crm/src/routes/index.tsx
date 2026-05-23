import { createRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/landing/landing-page";
import { Route as RootRoute } from "./__root";

function IndexComponent(): JSX.Element {
  return <LandingPage />;
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: IndexComponent,
});
