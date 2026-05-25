import { useQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { Mail, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

interface GlobalParticipant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  event: { id: string; name: string };
}

async function listAllParticipants(): Promise<GlobalParticipant[]> {
  const res = await api.get<GlobalParticipant[]>("/dashboard/participants");
  return res.data;
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  CONFIRMED: { label: "Confermato", bg: "bg-green-100", color: "text-green-700" },
  PAID: { label: "Pagato", bg: "bg-emerald-100", color: "text-emerald-700" },
  PENDING_PAYMENT: { label: "In attesa", bg: "bg-orange-100", color: "text-orange-700" },
  CANCELLED: { label: "Annullato", bg: "bg-gray-100", color: "text-gray-700" },
  REJECTED: { label: "Rifiutato", bg: "bg-red-100", color: "text-red-700" },
};

const STATUS_ORDER = ["CONFIRMED", "PAID", "PENDING_PAYMENT", "CANCELLED", "REJECTED"] as const;

function ParticipantsGlobalPage(): JSX.Element {
  const q = useQuery({ queryKey: ["participants-global"], queryFn: listAllParticipants });
  const [eventFilter, setEventFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const events = useMemo(() => {
    if (!q.data) return [] as { id: string; name: string }[];
    const map = new Map<string, string>();
    for (const p of q.data) map.set(p.event.id, p.event.name);
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [q.data]);

  const filtered = useMemo(() => {
    if (!q.data) return [] as GlobalParticipant[];
    return q.data.filter(
      (p) =>
        (eventFilter === "ALL" || p.event.id === eventFilter) &&
        (statusFilter === "ALL" || p.status === statusFilter),
    );
  }, [q.data, eventFilter, statusFilter]);

  const hasAny = (q.data?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partecipanti</h1>
        <p className="text-muted-foreground text-sm mt-1">Tutti i partecipanti dei tuoi eventi</p>
      </div>

      {hasAny && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="event-filter">
              Evento
            </label>
            <select
              id="event-filter"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">Tutti</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="status-filter">
              Stato
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="ALL">Tutti</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]?.label ?? s}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} di {q.data?.length ?? 0}
          </div>
        </div>
      )}

      {!hasAny ? (
        <Card className="p-10 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-semibold">Nessun partecipante</h2>
          <p className="text-sm text-muted-foreground mt-1">Quando avrai iscritti li vedrai qui.</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-semibold">Nessun risultato</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Nessun partecipante corrisponde ai filtri selezionati.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {filtered.map((p) => {
              const meta = STATUS_LABEL[p.status] ?? { label: p.status, bg: "bg-muted", color: "text-muted-foreground" };
              return (
                <div key={p.id} className="flex items-center gap-3 p-4 hover:bg-muted/30">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{p.firstName} {p.lastName}</span>
                      <span className={cn("text-[10px] uppercase font-medium px-1.5 py-0.5 rounded-full", meta.bg, meta.color)}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>
                      <Link to="/events/$id" params={{ id: p.event.id }} className="text-primary hover:underline">{p.event.name}</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/participants",
  component: ParticipantsGlobalPage,
});
