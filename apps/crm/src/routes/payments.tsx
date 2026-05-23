import { useQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, ChevronDown, ChevronRight, Clock, CreditCard, Receipt, XCircle } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Route as RootRoute } from "./__root";

interface GlobalPaymentItem {
  id: string;
  amountCents: number;
  feeCents: number;
  currency: string;
  status: string;
  paidAt: string | null;
  participantEmail: string;
  participantName: string;
  ticketCode: string | null;
}

interface EventPaymentsGroup {
  eventId: string;
  eventName: string;
  eventStartAt: string;
  totalCollectedCents: number;
  totalFeesCents: number;
  paymentsCount: number;
  payments: GlobalPaymentItem[];
}

async function fetchByEvent(): Promise<EventPaymentsGroup[]> {
  const res = await api.get<EventPaymentsGroup[]>("/payments/by-event");
  return res.data;
}

function fmt(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);
}

function StatusBadge({ status }: { status: string }): JSX.Element {
  const map: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
    SUCCEEDED: { label: "Pagato", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    PENDING: { label: "In attesa", cls: "bg-amber-100 text-amber-700", icon: Clock },
    PROCESSING: { label: "In elaborazione", cls: "bg-blue-100 text-blue-700", icon: Clock },
    FAILED: { label: "Fallito", cls: "bg-red-100 text-red-700", icon: XCircle },
    REFUNDED: { label: "Rimborsato", cls: "bg-gray-100 text-gray-700", icon: Receipt },
  };
  const m = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-700", icon: Clock };
  const Icon = m.icon;
  return <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${m.cls}`}><Icon className="h-2.5 w-2.5" />{m.label}</span>;
}

function EventGroup({ group, defaultOpen }: { group: EventPaymentsGroup; defaultOpen: boolean }): JSX.Element {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 text-left"
      >
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <Link
            to="/events/$id"
            params={{ id: group.eventId }}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold truncate hover:underline"
          >
            {group.eventName}
          </Link>
          <div className="text-xs text-muted-foreground">
            {new Date(group.eventStartAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })} · {group.paymentsCount} pagamenti
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold tabular-nums">{fmt(group.totalCollectedCents)}</div>
          <div className="text-[11px] text-muted-foreground">Fee {fmt(group.totalFeesCents)}</div>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="border-t divide-y">
          {group.payments.map((p) => (
            <div key={p.id} className="p-3 sm:p-4 flex items-center gap-3 hover:bg-muted/20">
              <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                {p.participantName.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.participantName}</div>
                <div className="text-xs text-muted-foreground truncate">{p.participantEmail}</div>
                {p.paidAt && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(p.paidAt).toLocaleString("it-IT")}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold tabular-nums">{fmt(p.amountCents, p.currency)}</div>
                <div className="mt-0.5"><StatusBadge status={p.status} /></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PaymentsPage(): JSX.Element {
  const q = useQuery({ queryKey: ["payments-by-event"], queryFn: fetchByEvent });

  const totalCollected = (q.data ?? []).reduce((acc, g) => acc + g.totalCollectedCents, 0);
  const totalFees = (q.data ?? []).reduce((acc, g) => acc + g.totalFeesCents, 0);
  const totalCount = (q.data ?? []).reduce((acc, g) => acc + g.paymentsCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pagamenti</h1>
        <p className="text-muted-foreground text-sm mt-1">Pagamenti dei partecipanti raggruppati per evento</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Totale incassato</div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight">{fmt(totalCollected)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Commissioni</div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight">{fmt(totalFees)}</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-medium text-muted-foreground">N° transazioni</div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight">{totalCount}</div>
        </Card>
      </div>

      {q.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      )}

      {q.data && q.data.length === 0 && (
        <Card className="p-10 text-center">
          <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-semibold">Nessun pagamento ricevuto</h2>
          <p className="text-sm text-muted-foreground mt-1">I pagamenti dei partecipanti agli eventi a pagamento appariranno qui.</p>
        </Card>
      )}

      {q.data && q.data.length > 0 && (
        <div className="space-y-3">
          {q.data.map((g, i) => <EventGroup key={g.eventId} group={g} defaultOpen={i === 0} />)}
        </div>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/payments",
  component: PaymentsPage,
});
