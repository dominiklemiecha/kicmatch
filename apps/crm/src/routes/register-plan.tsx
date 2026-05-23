import { createRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Briefcase, Gem, Gift, Star } from "lucide-react";
import { useEffect } from "react";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { WizardLayout } from "@/features/onboarding/wizard-layout";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

interface PlanCard {
  id: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE";
  name: string;
  price: string;
  desc: string;
  icon: typeof Gift;
  iconBg: string;
  comingSoon?: boolean;
}

const CARDS: PlanCard[] = [
  {
    id: "FREE",
    name: "Free",
    price: "€0 / per sempre",
    desc: "Per privati e piccoli eventi",
    icon: Gift,
    iconBg: "from-orange-400 to-pink-500",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "€29 / mese",
    desc: "Per organizzatori e creator",
    icon: Star,
    iconBg: "from-purple-500 to-violet-700",
    comingSoon: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: "€199 / mese",
    desc: "Per aziende e corporate",
    icon: Briefcase,
    iconBg: "from-blue-500 to-indigo-600",
    comingSoon: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "Custom",
    desc: "Per circuiti e grandi aziende",
    icon: Gem,
    iconBg: "from-gray-700 to-gray-900",
    comingSoon: true,
  },
];

function RegisterPlanPage(): JSX.Element {
  const navigate = useNavigate();
  const setPlan = useOnboardingStore((s) => s.setPlan);
  const selectedPlan = useOnboardingStore((s) => s.plan);
  const search = useSearch({ strict: false }) as { plan?: string };

  useEffect(() => {
    const planParam = search?.plan?.toUpperCase();
    const card = CARDS.find((c) => c.id === planParam);
    if (card && !card.comingSoon) {
      setPlan(card.id);
      void navigate({ to: "/register/account", replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search?.plan]);

  const pick = (card: PlanCard): void => {
    if (card.comingSoon) return;
    setPlan(card.id);
    void navigate({ to: "/register/account" });
  };

  return (
    <WizardLayout
      step={{ current: 1, total: 8 }}
      title="Scegli il tuo piano"
      subtitle="Potrai cambiare in qualsiasi momento dalle impostazioni"
      backTo="/register"
    >
      <div className="space-y-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const active = selectedPlan === c.id;
          const disabled = c.comingSoon === true;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c)}
              disabled={disabled}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                disabled
                  ? "border-input bg-muted/30 cursor-not-allowed opacity-70"
                  : active
                    ? "border-primary bg-primary/5"
                    : "border-input hover:bg-accent/5",
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br",
                  c.iconBg,
                  disabled && "grayscale",
                )}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2">
                  {c.name}
                  {disabled && (
                    <span className="rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5">
                      In arrivo
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{c.desc}</div>
              </div>
              <div className={cn("text-sm font-semibold tabular-nums shrink-0", disabled && "text-muted-foreground")}>
                {c.price}
              </div>
            </button>
          );
        })}
        <p className="text-xs text-muted-foreground text-center pt-2">
          Inizia gratis. Potrai fare upgrade in qualsiasi momento.
        </p>
      </div>
    </WizardLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register/plan",
  component: RegisterPlanPage,
});
