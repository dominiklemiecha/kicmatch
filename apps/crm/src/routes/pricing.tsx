import { createRoute, useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Gem,
  Gift,
  HandCoins,
  Headphones,
  PieChart,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LandingShell } from "@/features/landing/landing-shell";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

interface Plan {
  id: "free" | "pro" | "business" | "enterprise";
  name: string;
  tagline: string;
  monthly: string;
  yearly: string;
  cadence: string;
  yearlyCadence: string;
  icon: typeof Gift;
  iconBg: string;
  features: string[];
  feeLabel: string;
  feeValue: string;
  feeTable?: { method: string; fee: string }[];
  cta: string;
  ctaVariant: "outline-pink" | "primary" | "blue" | "black";
  footnoteIcon: typeof CheckCircle2;
  footnote: string;
  popular?: boolean;
  dark?: boolean;
  comingSoon?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "FREE PLAN",
    tagline: "Ideale per privati, piccoli eventi e primi utilizzatori.",
    monthly: "€0",
    yearly: "€0",
    cadence: "per sempre",
    yearlyCadence: "per sempre",
    icon: Gift,
    iconBg: "bg-gradient-to-br from-orange-400 to-pink-500",
    features: [
      "1 evento attivo",
      "Max 50 invitati",
      "RSVP base",
      "Branding Kicmatch",
      "Pagamento tramite piattaforma Kicmatch",
    ],
    feeLabel: "Fee transazioni",
    feeValue: "5%-8% in base al metodo di pagamento",
    feeTable: [
      { method: "Carta / Apple Pay / Google Pay", fee: "5%" },
      { method: "PayPal", fee: "6%" },
      { method: "Bonifico manuale con verifica", fee: "8%" },
    ],
    cta: "Inizia gratis",
    ctaVariant: "outline-pink",
    footnoteIcon: CheckCircle2,
    footnote: "Nessuna carta richiesta",
  },
  {
    id: "pro",
    name: "PRO PLAN",
    tagline: "Ideale per organizzatori, club, creator, coach, automotive e community.",
    monthly: "€29",
    yearly: "€278",
    cadence: "/mese",
    yearlyCadence: "/anno",
    icon: Star,
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-700",
    features: [
      "Eventi illimitati",
      "Branding personalizzato",
      "Dominio personalizzato",
      "Reminder automatici",
      "Analytics",
      "Export Excel",
      "QR Check-in",
      "Bonifico manuale",
      "Email personalizzate",
    ],
    feeLabel: "Fee transazioni",
    feeValue: "3%",
    cta: "In arrivo",
    ctaVariant: "primary",
    footnoteIcon: CheckCircle2,
    footnote: "Disponibile a breve",
    popular: true,
    comingSoon: true,
  },
  {
    id: "business",
    name: "BUSINESS PLAN",
    tagline: "Ideale per aziende, convention, motorsport, hotel ed eventi corporate.",
    monthly: "€199",
    yearly: "€1.910",
    cadence: "/mese",
    yearlyCadence: "/anno",
    icon: Briefcase,
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    features: [
      "Team multiutente",
      "Ruoli e permessi admin",
      "CRM invitati",
      "Automazioni",
      "API",
      "White-label light",
      "Sponsor area",
      "Networking matching",
      "Priority support",
    ],
    feeLabel: "Fee transazioni",
    feeValue: "1.5% - 2%",
    cta: "In arrivo",
    ctaVariant: "blue",
    footnoteIcon: Calendar,
    footnote: "Disponibile a breve",
    comingSoon: true,
  },
  {
    id: "enterprise",
    name: "ENTERPRISE PLAN",
    tagline: "Ideale per circuiti, grandi aziende, gruppi automotive, fiere ed eventi internazionali.",
    monthly: "Custom",
    yearly: "Custom",
    cadence: "prezzo su richiesta",
    yearlyCadence: "prezzo su richiesta",
    icon: Gem,
    iconBg: "bg-gradient-to-br from-gray-700 to-gray-900",
    features: [
      "White-label completo",
      "App dedicata",
      "Dominio personalizzato",
      "Generazione QR code ticket evento",
      "Onboarding dedicato",
      "Account manager",
      "SLA & supporto prioritario",
      "Server dedicati opzionali",
      "API avanzate",
      "SSO aziendale",
    ],
    feeLabel: "Fee transazioni",
    feeValue: "Custom o azzerabili",
    cta: "In arrivo",
    ctaVariant: "black",
    footnoteIcon: Headphones,
    footnote: "Disponibile a breve",
    dark: true,
    comingSoon: true,
  },
];

function PricingPage(): JSX.Element {
  const [period, setPeriod] = useState<"M" | "Y">("M");
  const navigate = useNavigate();
  return (
    <LandingShell>
      {/* Main */}
      <section className="bg-gradient-to-b from-white via-purple-50/30 to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 sm:pt-6 pb-3 text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-fuchsia-500 to-pink-500 bg-clip-text text-transparent leading-tight">
            Scegli il piano perfetto per i tuoi eventi
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
            Piani semplici, trasparenti e pensati per crescere insieme a te.
          </p>
          <div className="mt-3 inline-flex items-center rounded-full border bg-white p-1 shadow-sm">
            <button
              onClick={() => setPeriod("M")}
              className={cn(
                "rounded-full px-4 py-1 text-xs font-medium transition-colors",
                period === "M" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Mensile
            </button>
            <button
              onClick={() => setPeriod("Y")}
              className={cn(
                "rounded-full px-4 py-1 text-xs font-medium transition-colors inline-flex items-center gap-2",
                period === "Y" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Annuale
              <span className="text-[9px] rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 font-semibold">-20%</span>
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const FootIcon = plan.footnoteIcon;
              const price = period === "Y" ? plan.yearly : plan.monthly;
              const cadence = period === "Y" ? plan.yearlyCadence : plan.cadence;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-xl border bg-white p-4 transition-shadow",
                    plan.popular && !plan.comingSoon && "border-2 border-primary shadow-lg",
                    plan.dark && "bg-gradient-to-br from-gray-900 to-black text-white border-gray-800",
                    plan.comingSoon && "opacity-75",
                  )}
                >
                  {plan.comingSoon ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 shadow">
                        IN ARRIVO
                      </span>
                    </div>
                  ) : plan.popular ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 shadow">
                        PIÙ POPOLARE
                      </span>
                    </div>
                  ) : null}

                  {/* Icon + Title row */}
                  <div className="flex items-start gap-2 mb-1">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", plan.iconBg)}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-xs font-bold tracking-wider", plan.dark ? "text-white/80" : "text-foreground")}>
                        {plan.name}
                      </div>
                      <p className={cn("mt-0.5 text-[11px] leading-snug", plan.dark ? "text-white/60" : "text-muted-foreground")}>
                        {plan.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-1.5">
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-2xl font-bold tracking-tight">{price}</span>
                      <span className={cn("text-xs", plan.dark ? "text-white/60" : "text-muted-foreground")}>{cadence}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mt-2 space-y-1 text-[11px] flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className={cn("h-4 w-4 shrink-0 mt-0.5", plan.dark ? "text-white/80" : "text-primary")} />
                        <span className={plan.dark ? "text-white/80" : "text-foreground/80"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Fee box */}
                  <div
                    className={cn(
                      "mt-2.5 rounded-md p-2",
                      plan.dark
                        ? "bg-white/5 border border-white/10"
                        : plan.id === "free"
                          ? "bg-pink-50/70 border border-pink-200"
                          : "bg-purple-50/70 border border-purple-200",
                    )}
                  >
                    <div className={cn("text-xs font-semibold", plan.dark ? "text-white" : "text-primary")}>
                      {plan.feeLabel}
                    </div>
                    <div className={cn("text-xs mt-0.5", plan.dark ? "text-white/70" : "text-muted-foreground")}>
                      {plan.feeValue}
                    </div>
                    {plan.feeTable && (
                      <table className="mt-2 w-full text-xs table-fixed break-words">
                        <thead>
                          <tr className="text-muted-foreground border-b border-pink-200/60">
                            <th className="text-left py-1 font-medium">Metodo</th>
                            <th className="text-right py-1 font-medium">Fee</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plan.feeTable.map((row) => (
                            <tr key={row.method} className="border-b border-pink-200/40 last:border-0">
                              <td className="py-1 text-foreground/80 pr-2">{row.method}</td>
                              <td className="py-1 text-right font-semibold">{row.fee}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-2.5">
                    <Button
                      size="sm"
                      disabled={plan.comingSoon}
                      onClick={() => {
                        if (plan.comingSoon) return;
                        void navigate({ to: "/register/plan", search: { plan: plan.id.toUpperCase() } });
                      }}
                      className={cn(
                        "w-full rounded-lg",
                        plan.comingSoon
                          ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted"
                          : plan.ctaVariant === "primary"
                            ? "bg-primary hover:bg-primary/90 text-white"
                            : plan.ctaVariant === "blue"
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : plan.ctaVariant === "black"
                                ? "bg-black hover:bg-black/90 text-white"
                                : plan.ctaVariant === "outline-pink"
                                  ? "bg-transparent border-2 border-pink-500 text-pink-600 hover:bg-pink-50"
                                  : "",
                      )}
                    >
                      {plan.cta}
                    </Button>
                  </div>

                  {/* Footnote */}
                  <p
                    className={cn(
                      "mt-2 text-center text-[11px] inline-flex items-center justify-center gap-1.5",
                      plan.dark ? "text-white/50" : "text-muted-foreground",
                    )}
                  >
                    <FootIcon className="h-3 w-3" />
                    {plan.footnote}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Reassurance strip */}
          <div className="mt-5 rounded-xl border bg-white p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ReassuranceRow icon={ShieldCheck} title="Pagamenti sicuri" desc="Tutti i pagamenti sono gestiti in modo sicuro e conforme PCI." />
              <ReassuranceRow icon={HandCoins} title="Incassa con Kicmatch" desc="Non vuoi collegare Stripe? Incassa Kicmatch per te." linkText="Scopri di più →" />
              <ReassuranceRow icon={PieChart} title="Solo paghi se guadagni" desc="Nessun costo fisso, paghi solo sulle transazioni." />
              <ReassuranceRow icon={Headphones} title="Supporto sempre incluso" desc="Siamo sempre al tuo fianco, in ogni piano." />
            </div>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}

function ReassuranceRow({ icon: Icon, title, desc, linkText }: { icon: typeof ShieldCheck; title: string; desc: string; linkText?: string }): JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        {linkText && <div className="text-xs text-primary font-medium mt-1 cursor-pointer hover:underline">{linkText}</div>}
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/pricing",
  component: PricingPage,
});
