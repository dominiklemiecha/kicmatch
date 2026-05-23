import { createRoute, useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/features/auth/auth-store";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { WizardLayout } from "@/features/onboarding/wizard-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

const PLAN_LABELS: Record<string, string> = {
  FREE: "Free",
  PRO: "Pro",
  BUSINESS: "Business",
  ENTERPRISE: "Enterprise",
};

const PLAN_BADGE_COLORS: Record<string, string> = {
  FREE: "bg-orange-100 text-orange-700",
  PRO: "bg-purple-100 text-purple-700",
  BUSINESS: "bg-blue-100 text-blue-700",
  ENTERPRISE: "bg-gray-100 text-gray-700",
};

const FREQ_LABELS: Record<string, string> = {
  ON_DEMAND: "Quando voglio",
  WEEKLY: "Settimanale",
  MONTHLY: "Mensile",
};

function RegisterReviewPage(): JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const onboarding = useOnboardingStore();

  const backTo =
    onboarding.paymentMethod === "STRIPE_CONNECT"
      ? "/register/stripe"
      : onboarding.paymentMethod === "KICMATCH_COLLECTS"
        ? "/register/kicmatch"
        : "/register/payment";

  return (
    <WizardLayout
      step={{ current: 6, total: 8 }}
      backTo={backTo}
      title="Riepilogo"
      subtitle="Controlla e completa la registrazione"
    >
      <div className="space-y-5">
        <section className="rounded-lg border p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dati account</div>
          <Row label="Nome" value={user ? `${user.firstName} ${user.lastName}` : "—"} />
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="Tipo profilo" value={onboarding.profileType === "PRIVATE" ? "Privato" : "Azienda"} />
          <Row label="Paese" value={onboarding.country} />
        </section>

        <section className="rounded-lg border p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Piano selezionato</div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Piano</span>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                PLAN_BADGE_COLORS[onboarding.plan] ?? "bg-gray-100 text-gray-700",
              )}
            >
              {PLAN_LABELS[onboarding.plan] ?? onboarding.plan}
            </span>
          </div>
        </section>

        <section className="rounded-lg border p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Metodo di pagamento
          </div>
          {onboarding.paymentMethod === "STRIPE_CONNECT" && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#635bff]">Stripe Connect</span>
              <span className="text-xs text-muted-foreground">
                {onboarding.stripeConnected ? "Account collegato ✓" : "Non ancora collegato"}
              </span>
            </div>
          )}
          {onboarding.paymentMethod === "KICMATCH_COLLECTS" && (
            <div className="space-y-2">
              <Row label="Metodo" value="Incassa con Kicmatch" />
              <Row label="Payout" value={FREQ_LABELS[onboarding.kicmatchPayoutFrequency] ?? onboarding.kicmatchPayoutFrequency} />
              {onboarding.kicmatchIbanHolder && (
                <Row label="Intestatario" value={onboarding.kicmatchIbanHolder} />
              )}
              {onboarding.kicmatchIban && (
                <Row label="IBAN" value={`****${onboarding.kicmatchIban.slice(-4)}`} />
              )}
            </div>
          )}
          {!onboarding.paymentMethod && (
            <p className="text-sm text-muted-foreground">Nessun metodo selezionato</p>
          )}
        </section>

        <Button onClick={() => void navigate({ to: "/register/done" })} className="w-full" size="lg">
          Conferma e continua
        </Button>
      </div>
    </WizardLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register/review",
  component: RegisterReviewPage,
});
