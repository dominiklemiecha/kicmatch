import { useQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { Bookmark, Calendar, CalendarPlus, CheckCircle2, CreditCard, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Route as RootRoute } from "./__root";

interface DashboardOverview {
  invitedCount: number;
  confirmedCount: number;
  paidCount: number;
  revenueCents: number;
  currency: string;
  enrollmentTrend: { date: string; v: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
  upcomingEvents: { id: string; name: string; startAt: string; locationName: string | null; locationType: string; capacity: number | null; participantCount: number }[];
  recentActivity: { type: string; title: string; subtitle: string; at: string }[];
}

async function fetchOverview(): Promise<DashboardOverview> {
  const res = await api.get<DashboardOverview>("/dashboard/overview");
  return res.data;
}

function fmtCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);
}

function DashboardPage(): JSX.Element {
  const q = useQuery({ queryKey: ["dashboard-overview"], queryFn: fetchOverview, refetchInterval: 30000 });
  const data = q.data;

  const isEmpty = data
    && data.invitedCount === 0
    && data.confirmedCount === 0
    && data.paidCount === 0
    && data.revenueCents === 0
    && data.upcomingEvents.length === 0
    && data.recentActivity.length === 0;

  if (isEmpty) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Tutti i tuoi eventi in un colpo d'occhio</p>
        </div>
        <div className="rounded-2xl border-2 border-dashed bg-card px-6 py-16 sm:py-24 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CalendarPlus className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">Crea il tuo primo evento</h2>
            <p className="mt-2 text-sm text-muted-foreground">Inizia ora e rendi unico il tuo evento.</p>
            <Link to="/events/new" className="inline-block mt-6">
              <Button size="lg" className="px-8 rounded-full">Crea evento</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Tutti i tuoi eventi in un colpo d'occhio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Invitati" value={data?.invitedCount.toLocaleString("it-IT") ?? "—"} icon={Bookmark} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <KpiCard label="Confermati" value={data?.confirmedCount.toLocaleString("it-IT") ?? "—"} icon={CheckCircle2} iconBg="bg-green-100" iconColor="text-green-600" />
        <KpiCard label="Pagati" value={data?.paidCount.toLocaleString("it-IT") ?? "—"} icon={CreditCard} iconBg="bg-orange-100" iconColor="text-orange-600" />
        <KpiCard label="Incassi" value={data ? fmtCurrency(data.revenueCents, data.currency) : "—"} icon={TrendingUp} iconBg="bg-pink-100" iconColor="text-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="text-sm font-semibold mb-3">Andamento iscrizioni (ultimi 7 giorni)</div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.enrollmentTrend ?? []} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2} fill="url(#dashTrendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-semibold mb-3">Stato partecipanti</div>
          {!data || data.statusBreakdown.every((b) => b.value === 0) ? (
            <div className="h-44 rounded-lg border border-dashed bg-muted/20 flex items-center justify-center text-center text-xs text-muted-foreground px-4">Ancora nessun partecipante</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-32 w-32 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data.statusBreakdown} dataKey="value" innerRadius={40} outerRadius={56} paddingAngle={2} stroke="none">
                      {data.statusBreakdown.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-1.5 text-xs">
                {data.statusBreakdown.map((d) => (
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
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold">Prossimi eventi</div>
            <Link to="/events" className="text-xs text-primary hover:underline">Vedi tutti</Link>
          </div>
          {data && data.upcomingEvents.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Nessun evento programmato. <Link to="/events/new" className="text-primary hover:underline">Creane uno</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.upcomingEvents.map((e) => {
                const pct = e.capacity ? Math.round((e.participantCount / e.capacity) * 100) : 0;
                return (
                  <Link key={e.id} to="/events/$id" params={{ id: e.id }} className="block">
                    <div className="space-y-2 rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="font-semibold text-sm">{e.name}</div>
                          <div className="text-xs text-muted-foreground">{new Date(e.startAt).toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" })} · {e.locationType === "ONLINE" ? "Online" : e.locationName ?? "—"}</div>
                        </div>
                        <div className="text-xs tabular-nums text-muted-foreground">
                          <span className="font-semibold text-foreground">{e.participantCount}</span>{e.capacity ? `/${e.capacity}` : ""}
                        </div>
                      </div>
                      {e.capacity && <Progress value={pct} className="h-1.5" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="text-sm font-semibold mb-4">Attività recenti</div>
          {data && data.recentActivity.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">Nessuna attività recente</div>
          ) : (
            <div className="space-y-3">
              {data?.recentActivity.map((a, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    {a.type === "PAID" ? <CreditCard className="h-4 w-4 text-green-600" /> : <Users className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="text-sm leading-tight min-w-0">
                    <div className="font-medium truncate">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{a.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}

interface KpiCardProps { label: string; value: string; icon: typeof Bookmark; iconBg: string; iconColor: string }
function KpiCard({ label, value, icon: Icon, iconBg, iconColor }: KpiCardProps): JSX.Element {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
        </div>
        <div className={`rounded-md p-2 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/dashboard",
  component: DashboardPage,
});
