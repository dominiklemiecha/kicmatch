import { useQuery } from "@tanstack/react-query";
import { createRoute, useParams, useSearch } from "@tanstack/react-router";
import { Calendar, CalendarPlus, CheckCircle2, MapPin, Ticket } from "lucide-react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Route as RootRoute } from "./__root";

interface CheckoutInfo {
  eventName: string;
  eventStartAt: string;
  eventEndAt: string | null;
  locationName: string | null;
  locationAddress: string | null;
  locationType: string;
  onlineUrl: string | null;
  slug: string;
  participantEmail: string;
  ticketCode: string | null;
  status: string;
}

async function fetchCheckoutInfo(sessionId: string): Promise<CheckoutInfo> {
  const res = await api.get<CheckoutInfo>(`/public/checkout/${sessionId}`);
  return res.data;
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toIcsDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

function downloadIcs(info: CheckoutInfo): void {
  const start = toIcsDate(info.eventStartAt);
  const end = info.eventEndAt ? toIcsDate(info.eventEndAt) : toIcsDate(new Date(new Date(info.eventStartAt).getTime() + 2 * 60 * 60 * 1000).toISOString());
  const location = info.locationType === "ONLINE" ? (info.onlineUrl ?? "Online") : [info.locationName, info.locationAddress].filter(Boolean).join(", ");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kicmatch//IT",
    "BEGIN:VEVENT",
    `UID:${info.slug}-${info.ticketCode ?? "guest"}@kicmatch`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${info.eventName}`,
    `LOCATION:${location}`,
    info.ticketCode ? `DESCRIPTION:Codice partecipante: ${info.ticketCode}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${info.eventName.replace(/[^\w\s-]/g, "")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function Confetti(): JSX.Element {
  // Static decorative confetti dots
  const dots = [
    { x: "8%", y: "12%", c: "#fbbf24", s: 5 },
    { x: "18%", y: "30%", c: "#f472b6", s: 3 },
    { x: "12%", y: "55%", c: "#a78bfa", s: 4 },
    { x: "22%", y: "78%", c: "#34d399", s: 3 },
    { x: "32%", y: "8%", c: "#f87171", s: 4 },
    { x: "42%", y: "22%", c: "#60a5fa", s: 3 },
    { x: "55%", y: "8%", c: "#fbbf24", s: 4 },
    { x: "68%", y: "20%", c: "#a78bfa", s: 5 },
    { x: "82%", y: "10%", c: "#34d399", s: 3 },
    { x: "92%", y: "32%", c: "#f472b6", s: 4 },
    { x: "78%", y: "55%", c: "#fbbf24", s: 3 },
    { x: "88%", y: "78%", c: "#60a5fa", s: 4 },
    { x: "70%", y: "85%", c: "#f87171", s: 3 },
    { x: "48%", y: "88%", c: "#a78bfa", s: 4 },
    { x: "30%", y: "90%", c: "#34d399", s: 3 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{ left: d.x, top: d.y, width: d.s, height: d.s, background: d.c, opacity: 0.9 }}
        />
      ))}
    </div>
  );
}

function SuccessPage(): JSX.Element {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const search = useSearch({ strict: false }) as { session_id?: string };
  const sessionId = search?.session_id;
  const q = useQuery({
    queryKey: ["checkout-info", sessionId],
    queryFn: () => fetchCheckoutInfo(sessionId!),
    enabled: Boolean(sessionId),
    retry: 6,
    retryDelay: 1500,
  });

  const data = q.data;
  const location = data
    ? data.locationType === "ONLINE"
      ? "Evento online"
      : [data.locationName, data.locationAddress].filter(Boolean).join(", ")
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-card overflow-hidden shadow-2xl">
          {/* Dark header with confetti + check */}
          <div className="relative px-6 pt-7 pb-8 text-center text-white bg-gradient-to-b from-[#1a0f3a] to-[#0b0518] overflow-hidden">
            {/* Confetti dots */}
            <Confetti />
            <div className="relative">
              <img src="/logo_white.png" alt="Kicmatch" className="h-6 w-auto mx-auto opacity-90" />
              <div className="mt-6 mx-auto h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-emerald-500/25 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-9 w-9 text-white" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight">Iscrizione confermata!</h1>
              {data && (
                <>
                  <p className="mt-2 text-sm text-white/70">Sei iscritto a</p>
                  <p className="text-base font-semibold">{data.eventName}</p>
                </>
              )}
              {!data && q.isLoading && <p className="mt-2 text-sm text-white/70">Caricamento dettagli…</p>}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {data && (
              <>
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">Data</span>
                    <span className="text-foreground text-right">{fmtDateTime(data.eventStartAt)}</span>
                  </div>
                </div>
                {location && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 flex items-baseline justify-between gap-3">
                      <span className="text-muted-foreground">Luogo</span>
                      <span className="text-foreground text-right">{location}</span>
                    </div>
                  </div>
                )}
                {data.ticketCode && (
                  <div className="flex items-start gap-3 text-sm">
                    <Ticket className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 flex items-baseline justify-between gap-3">
                      <span className="text-muted-foreground">Codice partecipante</span>
                      <span className="text-foreground text-right font-mono text-xs">{data.ticketCode}</span>
                    </div>
                  </div>
                )}

                <div className="mt-3 rounded-lg bg-muted/40 px-4 py-3 text-center text-xs text-muted-foreground">
                  Abbiamo inviato tutti i dettagli all'email <span className="text-foreground font-medium">{data.participantEmail}</span>
                </div>
              </>
            )}

            <Button variant="outline" className="w-full rounded-lg" onClick={() => data && downloadIcs(data)} disabled={!data}>
              <CalendarPlus className="h-4 w-4 mr-2" /> Aggiungi al calendario
            </Button>
          </div>

          <div className="px-6 pb-6 pt-1">
            <a href={`/e/${data?.slug ?? slug}`} className="block">
              <Button className="w-full rounded-lg bg-primary hover:bg-primary/90" size="lg">Vedi pagina evento</Button>
            </a>
            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Il QR code per il check-in ti arriverà via email a breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/e/$slug/success",
  component: SuccessPage,
});
