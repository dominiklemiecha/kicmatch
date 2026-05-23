import { useQuery } from "@tanstack/react-query";
import type { EventPaymentSummary, PaymentListItem } from "@kicmatch/shared";
import { CheckCircle2, Clock, CreditCard, Receipt, TrendingDown, Wallet } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

async function listPayments(eventId: string): Promise<PaymentListItem[]> {
  const res = await api.get<PaymentListItem[]>(`/events/${eventId}/payments`);
  return res.data;
}

async function getPaymentsSummary(eventId: string): Promise<EventPaymentSummary> {
  const res = await api.get<EventPaymentSummary>(`/events/${eventId}/payments/summary`);
  return res.data;
}

interface PaymentsPanelProps {
  eventId: string;
}

export function PaymentsPanel({ eventId }: PaymentsPanelProps): JSX.Element {
  const summaryQ = useQuery({
    queryKey: ["payments-summary", eventId],
    queryFn: () => getPaymentsSummary(eventId),
    enabled: Boolean(eventId),
  });
  const listQ = useQuery({
    queryKey: ["payments", eventId],
    queryFn: () => listPayments(eventId),
    enabled: Boolean(eventId),
  });

  const fmt = (cents: number, currency: string): string =>
    new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Incassato</div>
              <div className="mt-1.5 text-2xl font-bold tracking-tight">
                {summaryQ.data ? fmt(summaryQ.data.totalCollectedCents, summaryQ.data.currency) : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {summaryQ.data?.successfulCount ?? 0} pagamenti
              </div>
            </div>
            <div className="rounded-md p-2 bg-emerald-100">
              <Wallet className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Commissioni Kicmatch</div>
              <div className="mt-1.5 text-2xl font-bold tracking-tight">
                {summaryQ.data ? fmt(summaryQ.data.totalFeesCents, summaryQ.data.currency) : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">8% piano FREE</div>
            </div>
            <div className="rounded-md p-2 bg-amber-100">
              <TrendingDown className="h-4 w-4 text-amber-600" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Da liquidare</div>
              <div className="mt-1.5 text-2xl font-bold tracking-tight text-primary">
                {summaryQ.data ? fmt(summaryQ.data.payoutDueCents, summaryQ.data.currency) : "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Bonifico manuale</div>
            </div>
            <div className="rounded-md p-2 bg-primary/10">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-5 border-b">
          <div className="font-semibold">Transazioni</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Tutti i pagamenti ricevuti per questo evento
          </div>
        </div>
        {listQ.isLoading && (
          <div className="p-5 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 rounded bg-muted animate-pulse" />
            ))}
          </div>
        )}
        {!listQ.isLoading && (!listQ.data || listQ.data.length === 0) && (
          <div className="p-10 text-center">
            <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h2 className="font-semibold">Nessuna transazione</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Le transazioni appariranno qui dopo il primo pagamento.
            </p>
          </div>
        )}
        {listQ.data && listQ.data.length > 0 && (
          <div className="divide-y">
            {listQ.data.map((p) => (
              <PaymentRow key={p.id} payment={p} fmt={fmt} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function PaymentRow({
  payment,
  fmt,
}: {
  payment: PaymentListItem;
  fmt: (c: number, cur: string) => string;
}): JSX.Element {
  const statusIcon = {
    SUCCEEDED: <CheckCircle2 className="h-4 w-4 text-green-600" />,
    PROCESSING: <Clock className="h-4 w-4 text-amber-600" />,
    PENDING: <Clock className="h-4 w-4 text-muted-foreground" />,
    FAILED: <CreditCard className="h-4 w-4 text-destructive" />,
    REFUNDED: <CreditCard className="h-4 w-4 text-muted-foreground" />,
  }[payment.status];

  const statusLabel: Record<PaymentListItem["status"], string> = {
    SUCCEEDED: "Riuscito",
    PROCESSING: "In elaborazione",
    PENDING: "In attesa",
    FAILED: "Fallito",
    REFUNDED: "Rimborsato",
  };

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
        {statusIcon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {payment.participant.firstName} {payment.participant.lastName}
        </div>
        <div className="text-xs text-muted-foreground truncate">{payment.participant.email}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold tabular-nums">{fmt(payment.amountCents, payment.currency)}</div>
        <div
          className={cn(
            "text-xs",
            payment.status === "SUCCEEDED" ? "text-green-600" : "text-muted-foreground",
          )}
        >
          {statusLabel[payment.status]}
        </div>
      </div>
    </div>
  );
}
