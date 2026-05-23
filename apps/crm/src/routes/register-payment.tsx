import { createRoute, useNavigate } from "@tanstack/react-router";
import { HandCoins } from "lucide-react";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { WizardLayout } from "@/features/onboarding/wizard-layout";
import { Button } from "@/components/ui/button";
import { Route as RootRoute } from "./__root";

function StripeLogo({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      viewBox="0 0 60 25"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="#635bff"
      aria-label="Stripe"
    >
      <path
        d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.14l.01 5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.58-.24 1.58-1C6.31 13.83 0 14.42 0 9.84 0 6.92 2.15 5.2 5.49 5.2c1.32 0 2.86.2 4.16.7v3.88a9.35 9.35 0 0 0-4.17-1.08c-.86 0-1.39.25-1.39.92 0 1.68 6.36.88 6.36 5.99z"
        fillRule="evenodd"
      />
    </svg>
  );
}

function RegisterPaymentPage(): JSX.Element {
  const navigate = useNavigate();
  const plan = useOnboardingStore((s) => s.plan);
  const setPaymentMethod = useOnboardingStore((s) => s.setPaymentMethod);

  const isFree = plan === "FREE";

  const handleStripe = (): void => {
    setPaymentMethod("STRIPE_CONNECT");
    void navigate({ to: "/register/stripe" });
  };

  const handleKicmatch = (): void => {
    setPaymentMethod("KICMATCH_COLLECTS");
    void navigate({ to: "/register/kicmatch" });
  };

  if (isFree) {
    return (
      <WizardLayout
        step={{ current: 4, total: 8 }}
        backTo="/register/profile"
        title="Metodo di pagamento"
        subtitle="Con il piano Free, incassiamo noi per te attraverso la piattaforma Kicmatch."
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <HandCoins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Incassa con Kicmatch</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Gestiamo noi i pagamenti per te. Ricevi i fondi sul tuo conto bancario quando vuoi.
                </p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Nessuna configurazione tecnica
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Più metodi di pagamento accettati
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Trasferimenti flessibili
              </li>
            </ul>
            <Button onClick={handleKicmatch} className="w-full" size="lg">
              Scegli questa opzione
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Vuoi più controllo sui pagamenti?{" "}
            <span className="text-primary font-medium">Passa al piano Pro per collegare Stripe.</span>
          </p>
        </div>
      </WizardLayout>
    );
  }

  return (
    <WizardLayout
      step={{ current: 4, total: 6 }}
      backTo="/register/profile"
      title="Metodo di pagamento"
      subtitle="Per ricevere pagamenti dai partecipanti, scegli come vuoi incassare."
    >
      <div className="space-y-4">
        {/* Option A: Stripe Connect */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-white border flex items-center justify-center shrink-0">
                <StripeLogo className="h-5 w-auto" />
              </div>
              <div>
                <div className="font-semibold">Collega il tuo account Stripe</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Ricevi i pagamenti direttamente sul tuo conto bancario tramite Stripe.
                </p>
              </div>
            </div>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded">
              Consigliato
            </span>
          </div>
          <Button onClick={handleStripe} className="w-full" size="lg">
            Collega Stripe
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          oppure
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Option B: Kicmatch Collects */}
        <div className="rounded-lg border p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <HandCoins className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold">Incassa con Kicmatch per me</div>
              <p className="text-sm text-muted-foreground mt-1">
                Gestiamo noi i pagamenti per te senza configurazioni tecniche.
              </p>
            </div>
          </div>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              Nessuna configurazione tecnica
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              Più metodi di pagamento accettati
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              Trasferimenti flessibili
            </li>
          </ul>
          <Button onClick={handleKicmatch} variant="outline" className="w-full" size="lg">
            Scegli questa opzione
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register/payment",
  component: RegisterPaymentPage,
});
