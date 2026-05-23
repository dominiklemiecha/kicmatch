import { Link, createRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/features/auth/auth-layout";
import { Route as RootRoute } from "./__root";

function ForgotPasswordPage(): JSX.Element {
  return (
    <AuthLayout
      title="Recupero password"
      subtitle="Questa funzione sarà disponibile presto"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          ← Torna al login
        </Link>
      }
    >
      <p className="text-sm text-muted-foreground text-center">
        Stiamo finalizzando il flusso di recupero. Nel frattempo contatta il supporto.
      </p>
    </AuthLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});
