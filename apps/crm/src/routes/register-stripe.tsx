import { createRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
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

function RegisterStripePage(): JSX.Element {
  const navigate = useNavigate();
  const stripeConnected = useOnboardingStore((s) => s.stripeConnected);
  const setStripeConnected = useOnboardingStore((s) => s.setStripeConnected);
  const setPaymentMethod = useOnboardingStore((s) => s.setPaymentMethod);

  const handleConnect = (): void => {
    setStripeConnected(true);
    setPaymentMethod("STRIPE_CONNECT");
    toast.info("Onboarding Stripe disponibile presto. Per ora simuliamo il collegamento.");
  };

  return (
    <WizardLayout step={{ current: 5, total: 8 }} backTo="/register/payment" title="Collega il tuo account Stripe">
      <div className="space-y-5">
        <div className="rounded-lg border bg-muted/30 p-6 text-center space-y-3">
          <StripeLogo className="h-8 mx-auto" />
          <div className="font-semibold">Collegati a Stripe in pochi secondi</div>
          <p className="text-sm text-muted-foreground">
            Verrai reindirizzato su Stripe per collegare il tuo account.
          </p>
          <Button onClick={handleConnect} className="w-full" size="lg" disabled={stripeConnected}>
            {stripeConnected ? "Collegato ✓" : "Collega con Stripe"}
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Non hai un account Stripe?{" "}
          <a
            className="text-primary font-medium hover:underline"
            href="https://dashboard.stripe.com/register"
            target="_blank"
            rel="noreferrer"
          >
            Creane uno
          </a>
        </p>
        {stripeConnected && (
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => void navigate({ to: "/register/review" })}
          >
            Continua
          </Button>
        )}
      </div>
    </WizardLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register/stripe",
  component: RegisterStripePage,
});
