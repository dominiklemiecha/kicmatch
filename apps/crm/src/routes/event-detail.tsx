import { useQuery } from "@tanstack/react-query";
import { Link, createRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { api } from "@/lib/api-client";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Lightbulb,
  Mail,
  MapPin,
  QrCode,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ParticipantListItem } from "@kicmatch/shared";
import { getEvent } from "@/features/events/events-api";
import { listInvitations } from "@/features/events/invitations-api";
import { listParticipants } from "@/features/events/participants-api";
import { CheckinPanel } from "@/features/events/checkin-panel";
import { EventSettingsPanel } from "@/features/events/event-settings-panel";
import { InvitationsPanel } from "@/features/events/invitations-panel";
import { ParticipantsPanel } from "@/features/events/participants-panel";
import { PaymentsPanel } from "@/features/events/payments-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

const MONTH_LABELS = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

function lastNDaysBuckets(n: number): { key: string; date: Date; label: string }[] {
  const arr: { key: string; date: Date; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`;
    arr.push({ key, date: d, label });
  }
  return arr;
}

function EventDetailPage(): JSX.Element {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const ev = useQuery({ queryKey: ["event", id], queryFn: () => getEvent(id), enabled: Boolean(id) });
  const invitations = useQuery({ queryKey: ["invitations", id], queryFn: () => listInvitations(id), enabled: Boolean(id) });
  const participantsQuery = useQuery({
    queryKey: ["participants", id, "ALL", ""],
    queryFn: () => listParticipants(id, {}),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (ev.data?.status === "DRAFT") {
      void navigate({ to: "/events/$id/inviti", params: { id }, replace: true });
    }
  }, [ev.data?.status, id, navigate]);

  const counts = useMemo(() => {
    const all = participantsQuery.data ?? [];
    return {
      confirmed: all.filter((p) => p.status === "CONFIRMED" || p.status === "PAID").length,
      paid: all.filter((p) => p.status === "PAID").length,
    };
  }, [participantsQuery.data]);

  const trendData = useMemo(() => {
    const buckets = lastNDaysBuckets(7);
    const counts = new Map<string, number>(buckets.map((b) => [b.key, 0]));
    const items = invitations.data ?? [];
    for (const i of items) {
      if (!i.email) continue;
      const k = i.createdAt.slice(0, 10);
      if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return buckets.map((b) => ({ date: b.label, v: counts.get(b.key) ?? 0 }));
  }, [invitations.data]);

  const summaryQuery = useQuery({
    queryKey: ["payments-summary", id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}/payments/summary`);
      return res.data as { totalCollectedCents: number; currency: string };
    },
    enabled: Boolean(id),
  });

  const inviteCount = invitations.data?.filter((i) => i.email).length ?? 0;
  const hasAnyInvites = inviteCount > 0;

  if (!ev.data) return <div className="h-64 rounded-lg bg-muted animate-pulse" />;
  if (ev.data.status === "DRAFT") return <div />;
  const e = ev.data;

  const formatPrice = (cents: number | null): string => {
    if (cents === null) return "—";
    return new Intl.NumberFormat("it-IT", { style: "currency", currency: e.currency }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link to="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Tutti gli eventi
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{e.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(e.startAt).toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {e.locationType === "ONLINE" ? "Online" : e.locationName ?? "—"}
            </span>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                e.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground",
              )}
            >
              {e.status === "PUBLISHED" ? "Pubblicato" : e.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ArrowUpRight className="h-4 w-4" />
            Anteprima
          </Button>
        </div>
      </div>

      <Tabs defaultValue="panoramica">
        <TabsList className="w-full overflow-x-auto justify-start">
          <TabsTrigger value="panoramica">
            <TrendingUp className="h-4 w-4" />
            Panoramica
          </TabsTrigger>
          <TabsTrigger value="partecipanti">
            <Users className="h-4 w-4" />
            Partecipanti
          </TabsTrigger>
          <TabsTrigger value="inviti">
            <Mail className="h-4 w-4" />
            Inviti
          </TabsTrigger>
          <TabsTrigger value="pagamenti">
            <CreditCard className="h-4 w-4" />
            Pagamenti
          </TabsTrigger>
          <TabsTrigger value="checkin">
            <QrCode className="h-4 w-4" />
            Check-in
          </TabsTrigger>
          <TabsTrigger value="impostazioni">
            <Settings className="h-4 w-4" />
            Impostazioni
          </TabsTrigger>
        </TabsList>

        <TabsContent value="panoramica" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Invitati" value={inviteCount.toString()} icon={Bookmark} iconBg="bg-purple-100" iconColor="text-purple-600" />
            <KpiCard label="Confermati" value={counts.confirmed.toString()} icon={CheckCircle2} iconBg="bg-green-100" iconColor="text-green-600" />
            <KpiCard label="Pagati" value={counts.paid.toString()} icon={CreditCard} iconBg="bg-orange-100" iconColor="text-orange-600" />
            <KpiCard label="Incassi" value={summaryQuery.data ? new Intl.NumberFormat("it-IT", { style: "currency", currency: summaryQuery.data.currency }).format(summaryQuery.data.totalCollectedCents / 100) : (e.isPaid ? "€0" : "—")} icon={TrendingUp} iconBg="bg-pink-100" iconColor="text-pink-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5 lg:col-span-2">
              <div className="text-sm font-semibold mb-3">Andamento inviti (ultimi 7 giorni)</div>
              {hasAnyInvites ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        cursor={{ stroke: "#7c3aed", strokeDasharray: "3 3" }}
                      />
                      <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2} fill="url(#trendGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart label="Nessun invito ancora" subtitle="I dati appariranno qui appena invierai i primi inviti." />
              )}
            </Card>

            <Card className="p-5">
              <div className="text-sm font-semibold mb-3">Stato partecipanti</div>
              <ParticipantsDonut participants={participantsQuery.data ?? []} />
            </Card>
          </div>

          <Card className="p-5">
            <div className="text-sm font-semibold mb-4">Prossimi passi consigliati</div>
            <div className="space-y-2.5">
              <NextStep icon={Settings} label="Completa le informazioni dell'evento" />
              <NextStep icon={Mail} label="Personalizza email di invito" />
              <NextStep icon={Bell} label="Imposta promemoria agli invitati" />
              <NextStep icon={QrCode} label="Scarica l'app per il check-in" />
            </div>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-amber-900">Suggerimento</div>
                <div className="text-amber-800 mt-0.5">
                  Aggiungi il QR code all'ingresso per velocizzare il check-in il giorno dell'evento.
                </div>
                <a href="#" className="inline-flex items-center text-amber-900 font-medium hover:underline mt-1 text-xs">
                  Scopri di più →
                </a>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="partecipanti" className="mt-6">
          <ParticipantsPanel eventId={id} />
        </TabsContent>

        <TabsContent value="inviti" className="mt-6">
          <InvitationsPanel eventId={id} />
        </TabsContent>

        <TabsContent value="pagamenti" className="mt-6">
          <PaymentsPanel eventId={id} />
        </TabsContent>

        <TabsContent value="checkin" className="mt-6">
          <CheckinPanel eventId={id} />
        </TabsContent>

        <TabsContent value="impostazioni" className="mt-6">
          <EventSettingsPanel eventId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: typeof Bookmark;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor }: KpiCardProps): JSX.Element {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className="mt-1.5 text-3xl font-bold tracking-tight">{value}</div>
        </div>
        <div className={`rounded-md p-2 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}

function NextStep({ icon: Icon, label }: { icon: typeof Bookmark; label: string }): JSX.Element {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm">
      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1">{label}</span>
      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-center justify-between border-b last:border-0 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EmptyChart({ label, subtitle }: { label: string; subtitle: string }): JSX.Element {
  return (
    <div className="h-44 rounded-lg border border-dashed bg-muted/20 flex flex-col items-center justify-center p-4 text-center">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-xs text-muted-foreground mt-1 max-w-xs">{subtitle}</div>
    </div>
  );
}

function ParticipantsDonut({ participants }: { participants: ParticipantListItem[] }): JSX.Element {
  const buckets = [
    { name: "Confermati", value: participants.filter((p) => p.status === "CONFIRMED").length, color: "#7c3aed" },
    { name: "Pagati", value: participants.filter((p) => p.status === "PAID").length, color: "#ec4899" },
    { name: "In attesa", value: participants.filter((p) => p.status === "PENDING_PAYMENT").length, color: "#fb923c" },
    { name: "Rifiutati", value: participants.filter((p) => p.status === "REJECTED" || p.status === "CANCELLED").length, color: "#94a3b8" },
  ];
  const total = buckets.reduce((acc, b) => acc + b.value, 0);
  if (total === 0) {
    return <EmptyChart label="Nessun partecipante ancora" subtitle="I dati arriveranno con le prime iscrizioni." />;
  }
  return (
    <div className="flex items-center gap-4">
      <div className="h-32 w-32 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={buckets} dataKey="value" innerRadius={40} outerRadius={56} paddingAngle={2} stroke="none">
              {buckets.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-1.5 text-xs">
        {buckets.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
              {d.name}
            </span>
            <span className="font-semibold tabular-nums">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/events/$id",
  component: EventDetailPage,
});
