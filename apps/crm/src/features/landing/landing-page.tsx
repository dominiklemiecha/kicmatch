import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileText,
  LayoutDashboard,
  PlayCircle,
  ScanLine,
  Send,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingShell } from "./landing-shell";

export function LandingPage(): JSX.Element {
  return (
    <LandingShell transparentHeader>
      {/* HERO */}
      <section
        className="relative text-white overflow-hidden bg-black"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-32 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2a2540] border border-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-white/80">Piattaforma all-in-one</span>
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Crea eventi.<br />
              Invita persone.<br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-pink-500 bg-clip-text text-transparent">
                Conferme e pagamenti
              </span><br />
              senza stress.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/70 max-w-md leading-relaxed">
              Kicmatch semplifica la gestione dei tuoi eventi<br className="hidden sm:block" />
              e ti aiuta a riempire ogni posto.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white gap-2 rounded-lg px-6">
                  Crea il tuo evento <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#1a1a2e]/80 border border-white/15 text-white hover:bg-[#1a1a2e] gap-2 rounded-lg px-6"
                asChild
              >
                <a href="#funzionalita-anchor"><PlayCircle className="h-4 w-4" /> Guarda la demo</a>
              </Button>
            </div>
          </div>

          {/* Right: dashboard mockup — hidden on small mobile */}
          <div className="relative hidden sm:flex justify-center lg:justify-end">
            <HeroDashboardMockup />
          </div>
        </div>
      </section>

      {/* 6 FEATURES */}
      <section id="funzionalita-anchor" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Tutto ciò che ti serve</h2>
            <p className="mt-3 text-muted-foreground">Dalla creazione dell'evento al check-in.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            <FeatureBox icon={Zap} title="Crea in 3 minuti" desc="Il tuo evento online in pochi clic, senza configurazioni." />
            <FeatureBox icon={Send} title="Invita chi vuoi" desc="Importa contatti, invia email o condividi un link. Gli inviti arrivano subito." />
            <FeatureBox icon={FileText} title="Moduli personalizzati" desc="Aggiungi i campi su misura per i tuoi eventi e domande condizionali." />
            <FeatureBox icon={CreditCard} title="Pagamenti integrati" desc="Accetta pagamenti online con Stripe, Apple Pay e Google Pay." />
            <FeatureBox icon={LayoutDashboard} title="Dashboard completa" desc="Tutti i numeri che ti servono: partecipanti, stati e incassi." />
            <FeatureBox icon={ScanLine} title="Check-in smart" desc="QR code e app dedicata per il check-in rapido di tutti i tuoi ospiti." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative overflow-hidden text-white bg-black"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20 lg:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Pronto a creare il tuo primo evento?</h2>
          <p className="mt-4 text-white/85 max-w-xl mx-auto leading-relaxed">
            Registrati gratis. Nessuna carta richiesta. Inizi in 3 minuti.
          </p>
          <div className="mt-7">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-lg px-7">
                Inizia gratis ora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </LandingShell>
  );
}

function FeatureBox({ icon: Icon, title, desc }: { icon: typeof Calendar; title: string; desc: string }): JSX.Element {
  return (
    <div className="group rounded-2xl border bg-white p-5 sm:p-6 hover:border-primary/40 hover:shadow-lg transition-all">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-pink-500/15 flex items-center justify-center group-hover:from-primary/20 group-hover:to-pink-500/20 transition-colors">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 sm:mt-5 font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HERO DASHBOARD MOCKUP
══════════════════════════════════════════════════════════════ */
function HeroDashboardMockup(): JSX.Element {
  const prossimiEventi = [
    {
      img: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=120&h=120&q=80",
      name: "KIC Motorsports Day",
      sub: "24 Maggio 2025 · Monza Circuit",
      count: "312",
    },
    {
      img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=120&h=120&q=80",
      name: "Dinner Experience",
      sub: "6 Giugno 2025 · Milano",
      count: "128",
    },
    {
      img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=120&h=120&q=80",
      name: "Tech Talk: AI & Future",
      sub: "16 Giugno 2025 · Online",
      count: "220",
    },
  ];

  return (
    <div className="relative w-full">
      {/* Glow behind card */}
      <div className="absolute -inset-10 rounded-3xl bg-gradient-to-br from-primary/40 via-fuchsia-500/25 to-orange-500/25 blur-3xl pointer-events-none" />

      {/* Outer card */}
      <div className="relative rounded-2xl bg-white border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-hidden">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-32 sm:w-40 bg-gray-50/70 border-r p-3 flex flex-col gap-0.5 shrink-0">
              <div className="mb-4 px-1">
                <img src="/logo.png" alt="kicmatch" className="h-6 w-auto" />
              </div>
              {[
                { label: "Panoramica", active: true },
                { label: "Eventi", active: false },
                { label: "Partecipanti", active: false },
                { label: "Inviti", active: false },
                { label: "Pagamenti", active: false },
                { label: "Moduli", active: false },
                { label: "Check-in", active: false },
                { label: "Impostazioni", active: false },
              ].map(({ label, active }) => (
                <div
                  key={label}
                  className={`text-[10px] sm:text-[11px] font-medium px-2 py-1.5 rounded ${
                    active ? "bg-primary text-white font-semibold" : "text-gray-500"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Main area */}
            <div className="flex-1 p-3 sm:p-4 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-bold text-gray-800">Dashboard</div>
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white text-[8px] font-bold">
                  KM
                </div>
              </div>

              {/* KPI 4 cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <BigKpi label="Invitati" value="1.248" badge="+12%" icon={<Bookmark className="h-3 w-3" />} iconBg="bg-purple-100" iconColor="text-purple-600" />
                <BigKpi label="Confermati" value="312" badge="+8%" icon={<CheckCircle2 className="h-3 w-3" />} iconBg="bg-green-100" iconColor="text-green-600" />
                <BigKpi label="Pagati" value="256" badge="+15%" icon={<CreditCard className="h-3 w-3" />} iconBg="bg-orange-100" iconColor="text-orange-600" />
                <BigKpi label="Incasso" value="€12.980" badge="+5%" icon={<TrendingUp className="h-3 w-3" />} iconBg="bg-pink-100" iconColor="text-pink-600" />
              </div>

              {/* Chart + Donut row */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {/* Andamento iscrizioni */}
                <div className="col-span-2 rounded-lg border bg-white p-2.5">
                  <div className="text-[10px] font-semibold text-gray-700 mb-1.5">Andamento iscrizioni</div>
                  <div className="relative h-24">
                    <div className="absolute inset-0 flex flex-col justify-between text-[7px] text-gray-400 pointer-events-none">
                      <span>400</span><span>300</span><span>200</span><span>100</span><span>0</span>
                    </div>
                    <svg viewBox="0 0 200 80" className="absolute inset-0 w-full h-full pl-5" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGradHero" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(124,58,237)" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="rgb(124,58,237)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Gridlines */}
                      {[10, 30, 50, 70].map((y) => (
                        <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#f0f0f0" strokeWidth="0.5" />
                      ))}
                      <path
                        d="M0 70 C20 65,35 60,50 55 C70 48,90 50,110 40 C130 30,150 25,170 15 C185 10,195 8,200 6 L200 80 L0 80 Z"
                        fill="url(#areaGradHero)"
                      />
                      <path
                        d="M0 70 C20 65,35 60,50 55 C70 48,90 50,110 40 C130 30,150 25,170 15 C185 10,195 8,200 6"
                        fill="none"
                        stroke="rgb(124,58,237)"
                        strokeWidth="1.8"
                      />
                    </svg>
                  </div>
                  <div className="mt-1 flex justify-between text-[7px] text-gray-400 pl-5">
                    <span>10 Apr</span><span>17 Apr</span><span>24 Apr</span><span>1 Mag</span><span>8 Mag</span><span>15 Mag</span>
                  </div>
                </div>

                {/* Stato partecipanti */}
                <div className="rounded-lg border bg-white p-2.5">
                  <div className="text-[10px] font-semibold text-gray-700 mb-1.5">Stato partecipanti</div>
                  <div className="flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="h-16 w-16">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f0f0f0" strokeWidth="5" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#7c3aed" strokeWidth="5" strokeDasharray="40 60" strokeDashoffset="0" transform="rotate(-90 18 18)" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#ec4899" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="-40" transform="rotate(-90 18 18)" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#fb923c" strokeWidth="5" strokeDasharray="15 85" strokeDashoffset="-70" transform="rotate(-90 18 18)" />
                    </svg>
                  </div>
                  <div className="mt-1 space-y-0.5 text-[7px]">
                    <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-purple-600" /><span className="text-gray-500">Conf.</span></div>
                    <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-pink-500" /><span className="text-gray-500">Pagati</span></div>
                  </div>
                </div>
              </div>

              {/* Prossimi eventi */}
              <div className="mt-3 rounded-lg border bg-white p-2.5">
                <div className="text-[10px] font-semibold text-gray-700 mb-1.5">Prossimi eventi</div>
                <div className="space-y-2">
                  {prossimiEventi.map((ev) => (
                    <div key={ev.name} className="flex items-center gap-2">
                      <img src={ev.img} alt={ev.name} className="h-9 w-9 rounded-md shrink-0 object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold text-gray-800 truncate">{ev.name}</div>
                        <div className="text-[8px] text-gray-500 truncate">{ev.sub}</div>
                        <div className="mt-1 h-1 w-full rounded-full bg-gray-100">
                          <div className="h-1 rounded-full bg-gradient-to-r from-primary to-pink-400" style={{ width: "70%" }} />
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-gray-500 tabular-nums">{ev.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive card mockup (forma telefono, niente Dynamic Island/pulsanti) */}
      <div className="absolute -bottom-2 right-2 sm:right-4 w-28 sm:w-32 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10">
        <div className="relative rounded-2xl bg-[#1c1c1e] p-1 shadow-2xl">
          <div className="relative rounded-xl bg-white overflow-hidden aspect-[9/18]">
            {/* Cover */}
            <div className="h-16 relative overflow-hidden shrink-0">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&h=200&q=80"
                alt="KIC Motorsports Day"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-1 left-2 text-white text-[8px] font-bold drop-shadow">KIC Motorsports Day</div>
            </div>

            {/* Body */}
            <div className="p-2 flex flex-col">
              <div className="text-[9px] font-bold leading-tight text-gray-900">KIC Motorsports Day</div>
              <div className="text-[7px] text-gray-500 mt-0.5 flex items-center gap-1">
                <Calendar className="h-2 w-2" />24 Maggio 2025
              </div>
              <div className="text-[7px] text-gray-500 flex items-center gap-1">
                <span className="text-[8px]">📍</span>Monza Circuit
              </div>
              <div className="mt-1.5 h-5 rounded-md bg-primary text-white text-[8px] flex items-center justify-center font-semibold shadow">
                Conferma partecipazione
              </div>
              <div className="mt-1.5 rounded-md border bg-gray-50/70 p-1.5">
                <div className="text-[7px] font-bold text-gray-700 mb-0.5">Panoramica</div>
                {[
                  { label: "Partecipanti", val: "312" },
                  { label: "Pagati", val: "256" },
                  { label: "In attesa", val: "44" },
                  { label: "Incasso", val: "€12.0k" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between items-center py-0.5">
                    <span className="text-[6px] text-gray-500">{r.label}</span>
                    <span className="text-[6px] font-semibold text-gray-800">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BigKpi({
  label,
  value,
  badge,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  badge: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}): JSX.Element {
  return (
    <div className="rounded-lg border bg-white px-2.5 py-2 min-w-0">
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className={`rounded p-0.5 shrink-0 ${iconBg} ${iconColor}`}>{icon}</span>
          <span className="text-[9px] text-gray-500 truncate">{label}</span>
        </div>
        <span className="text-[8px] font-semibold text-green-600 shrink-0">{badge}</span>
      </div>
      <div className="text-sm sm:text-base font-bold tracking-tight text-gray-900 tabular-nums truncate">{value}</div>
    </div>
  );
}
