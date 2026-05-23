import { Link, createRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Route as RootRoute } from "./__root";

function RegisterWelcomePage(): JSX.Element {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { plan?: string };

  const handleStart = (): void => {
    if (search?.plan) {
      void navigate({ to: `/register/plan?plan=${search.plan}` });
    } else {
      void navigate({ to: "/register/plan" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo className="h-14 w-auto" />
        </div>
        <div className="rounded-2xl border bg-card shadow-sm p-6 sm:p-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Benvenuto su kicmatch</h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            La piattaforma semplice per creare eventi, invitare persone e ricevere pagamenti.
          </p>
          <div className="mt-6 space-y-3">
            <Button className="w-full" size="lg" onClick={handleStart}>
              Registrati gratis
            </Button>
            <p className="text-sm text-muted-foreground">
              Hai già un account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Accedi
              </Link>
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Sicuro
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" /> Semplice
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-primary" /> Veloce
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register",
  component: RegisterWelcomePage,
});
