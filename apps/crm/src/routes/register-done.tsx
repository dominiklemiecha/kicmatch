import { createRoute, useNavigate } from "@tanstack/react-router";
import { CalendarPlus, CheckCircle2, LayoutDashboard, Lock, Users, type LucideIcon } from "lucide-react";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { Button } from "@/components/ui/button";
import { Route as RootRoute } from "./__root";

function NextItem({ icon: Icon, label }: { icon: LucideIcon; label: string }): JSX.Element {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      {label}
    </div>
  );
}

function RegisterDonePage(): JSX.Element {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
            <span className="rounded-full bg-white/20 px-2 py-0.5">7</span>
            Setup completato
          </div>
          <p className="text-xs text-muted-foreground mt-2">Il tuo account è pronto</p>
        </div>
        <div className="rounded-2xl border bg-card shadow-sm p-8 text-center space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center relative">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Account creato con successo!</h1>
            <p className="text-sm text-muted-foreground mt-2">Sei pronto per creare eventi straordinari.</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-5 text-left space-y-3">
            <div className="text-sm font-semibold">Cosa puoi fare ora?</div>
            <NextItem icon={CalendarPlus} label="Crea il tuo primo evento" />
            <NextItem icon={Users} label="Invita i partecipanti" />
            <NextItem icon={Lock} label="Ricevi pagamenti in sicurezza" />
            <NextItem icon={LayoutDashboard} label="Monitora tutto dalla tua dashboard" />
          </div>
          <Button onClick={() => void navigate({ to: "/register/onboarding" })} className="w-full" size="lg">
            Continua
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register/done",
  component: RegisterDonePage,
});
