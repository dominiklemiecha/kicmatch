import { Link, createRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Calendar,
  ChartBar,
  CheckCircle2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Mail,
  QrCode,
  ScanLine,
  Send,
  Settings,
  Sparkles,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LandingShell } from "@/features/landing/landing-shell";
import { Route as RootRoute } from "./__root";

interface Feature {
  icon: typeof Zap;
  title: string;
  desc: string;
}

const SEZIONI: { title: string; subtitle: string; features: Feature[] }[] = [
  {
    title: "Crea e gestisci eventi",
    subtitle: "Tutto quello che ti serve per organizzare eventi che funzionano",
    features: [
      { icon: Zap, title: "Wizard guidato", desc: "Crea il tuo evento in 5 step semplici: dettagli, inviti, modulo, biglietti, pubblicazione." },
      { icon: Calendar, title: "Eventi illimitati", desc: "Crea quanti eventi vuoi, in presenza o online, gratuiti o a pagamento." },
      { icon: FileText, title: "Moduli personalizzati", desc: "Drag & drop dei campi: nome, email, telefono, menu a scelta, domande aperte e privacy." },
    ],
  },
  {
    title: "Invita e gestisci partecipanti",
    subtitle: "Raggiungi le persone giuste e tienile aggiornate",
    features: [
      { icon: Mail, title: "Inviti via email", desc: "Email manuali, lista CSV/Excel o link condivisibile. Gli inviti arrivano subito." },
      { icon: Upload, title: "Import lista", desc: "Carica file CSV con centinaia di contatti in un click." },
      { icon: Bell, title: "Reminder automatici", desc: "Email di promemoria automatiche per chi non ha ancora confermato." },
      { icon: Users, title: "Gestione partecipanti", desc: "Lista, filtri, stato, ricerca, ed export CSV in qualsiasi momento." },
    ],
  },
  {
    title: "Pagamenti sicuri",
    subtitle: "Incassa con Kicmatch, gestisce noi la complessità",
    features: [
      { icon: CreditCard, title: "Stripe Checkout", desc: "Accetta pagamenti con carta, Apple Pay e Google Pay con sicurezza PCI." },
      { icon: ChartBar, title: "Dashboard pagamenti", desc: "Vedi saldo, commissioni, payout. Sempre trasparente." },
      { icon: CheckCircle2, title: "Conferma automatica", desc: "Il partecipante riceve email + biglietto QR appena paga." },
    ],
  },
  {
    title: "Check-in il giorno dell'evento",
    subtitle: "Velocissimo, anche se sei da solo",
    features: [
      { icon: QrCode, title: "QR Code generato", desc: "Ogni partecipante ha un codice univoco KIC-XXXX-XXXX-XXXX." },
      { icon: ScanLine, title: "Scanner mobile", desc: "Apri la dashboard sul telefono e scansiona. Niente app da installare." },
      { icon: LayoutDashboard, title: "Stats live", desc: "Quanti sono entrati? Quanti ancora attesi? Numeri in tempo reale." },
    ],
  },
  {
    title: "Comunica e analizza",
    subtitle: "Tutto sotto controllo, sempre",
    features: [
      { icon: Send, title: "Email transazionali", desc: "Conferme iscrizione e pagamento via SMTP del tuo provider preferito." },
      { icon: ChartBar, title: "Analytics in tempo reale", desc: "Andamento iscrizioni, stato partecipanti, incassi e proiezioni." },
      { icon: Settings, title: "Personalizzazioni", desc: "Modifica dati evento anche dopo la pubblicazione, in qualsiasi momento." },
    ],
  },
];

function FunzionalitaPage(): JSX.Element {
  return (
    <LandingShell transparentHeader>
      {/* Hero — same dark bg as home */}
      <section
        className="relative overflow-hidden text-white bg-black"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2a2540] border border-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 uppercase tracking-widest">
            <Sparkles className="h-3 w-3 text-primary" />
            Funzionalità
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Tutto ciò che ti serve<br className="hidden sm:block" /> per i tuoi eventi
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Una piattaforma completa per creare, gestire e far crescere i tuoi eventi — dalla creazione al check-in.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white rounded-lg px-6">
                Inizia gratis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" className="w-full sm:w-auto bg-[#1a1a2e]/80 border border-white/15 text-white hover:bg-[#1a1a2e] rounded-lg px-6">
                Vedi i prezzi
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sections */}
      {SEZIONI.map((sez, sezIdx) => (
        <section
          key={sez.title}
          className={sezIdx % 2 === 0 ? "bg-white" : "bg-gradient-to-br from-purple-50/40 via-white to-pink-50/40"}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="text-xs font-semibold uppercase tracking-widest text-primary">{`0${sezIdx + 1}`}</div>
              <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{sez.title}</h2>
              <p className="mt-3 text-muted-foreground">{sez.subtitle}</p>
            </div>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${
                sez.features.length >= 4
                  ? "lg:grid-cols-4"
                  : sez.features.length === 3
                    ? "lg:grid-cols-3 lg:max-w-4xl lg:mx-auto"
                    : "lg:grid-cols-2 lg:max-w-3xl lg:mx-auto"
              }`}
            >
              {sez.features.map((f) => {
                const Icon = f.icon;
                return (
                  <Card key={f.title} className="p-5 sm:p-6">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/15 to-pink-500/15 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section
        className="relative overflow-hidden text-white bg-black"
        style={{ backgroundImage: "url(/hero-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Inizia oggi, è gratis</h2>
          <p className="mt-4 text-white/85 max-w-xl mx-auto leading-relaxed">
            Crea il tuo primo evento e prova tutte le funzionalità senza limiti per il piano FREE.
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

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/funzionalita",
  component: FunzionalitaPage,
});
