import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { CheckCircle2, Clock, CreditCard, Receipt, Send, Wallet, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PayoutResponse } from "@kicmatch/shared";
import { useAuthStore } from "@/features/auth/auth-store";
import { createPayoutRequest, getPayoutBalance, listMyPayouts } from "@/features/payouts/payouts-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Route as RootRoute } from "./__root";

function fmt(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);
}

function StatusBadge({ status }: { status: PayoutResponse["status"] }): JSX.Element {
  const map: Record<PayoutResponse["status"], { label: string; cls: string; icon: typeof Clock }> = {
    PENDING: { label: "In attesa", cls: "bg-amber-100 text-amber-700", icon: Clock },
    APPROVED: { label: "Approvata", cls: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
    PAID: { label: "Pagata", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    REJECTED: { label: "Rifiutata", cls: "bg-red-100 text-red-700", icon: XCircle },
  };
  const m = map[status];
  const Icon = m.icon;
  return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${m.cls}`}><Icon className="h-3 w-3" />{m.label}</span>;
}

function PayoutsPage(): JSX.Element {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const balanceQ = useQuery({ queryKey: ["payout-balance"], queryFn: getPayoutBalance });
  const listQ = useQuery({ queryKey: ["payout-requests"], queryFn: listMyPayouts });

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");
  const [ibanHolder, setIbanHolder] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (balanceQ.data && !amount) {
      setAmount((balanceQ.data.availableCents / 100).toFixed(2));
    }
  }, [balanceQ.data]);

  useEffect(() => {
    if (user) {
      if (!ibanHolder) setIbanHolder(`${user.firstName} ${user.lastName}`);
    }
  }, [user]);

  const createMut = useMutation({
    mutationFn: () => createPayoutRequest({
      amountCents: Math.round(parseFloat(amount) * 100),
      iban: iban.replace(/\s/g, "").toUpperCase(),
      ibanHolder,
      notes: notes || undefined,
    }),
    onSuccess: () => {
      toast.success("Richiesta inviata. Ti contatteremo via email.");
      void qc.invalidateQueries({ queryKey: ["payout-balance"] });
      void qc.invalidateQueries({ queryKey: ["payout-requests"] });
      setShowForm(false);
      setAmount("");
      setNotes("");
    },
    onError: (error: AxiosError<{ message?: string; details?: Array<{ message: string }> }>) => {
      const msg = error.response?.data?.details?.[0]?.message ?? error.response?.data?.message ?? "Errore richiesta";
      toast.error(msg);
    },
  });

  const balance = balanceQ.data;
  const curr = balance?.currency ?? "EUR";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Richiedi Payout</h1>
        <p className="text-muted-foreground text-sm mt-1">Saldo, commissioni e richieste di payout</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Totale incassato" value={balance ? fmt(balance.totalCollectedCents, curr) : "—"} icon={Wallet} bg="bg-emerald-100" color="text-emerald-600" />
        <KpiCard label="Commissioni Kicmatch (8%)" value={balance ? fmt(balance.totalFeesCents, curr) : "—"} icon={Receipt} bg="bg-amber-100" color="text-amber-600" />
        <KpiCard label="Già liquidato" value={balance ? fmt(balance.totalPaidOutCents, curr) : "—"} icon={CheckCircle2} bg="bg-blue-100" color="text-blue-600" />
        <KpiCard label="Disponibile per payout" value={balance ? fmt(balance.availableCents, curr) : "—"} icon={CreditCard} bg="bg-primary/10" color="text-primary" highlight />
      </div>

      {balance && balance.availableCents > 0 && !showForm && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-pink-100/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Richiedi un payout</div>
            <div className="text-sm text-muted-foreground">Hai <span className="font-semibold text-primary">{fmt(balance.availableCents, curr)}</span> disponibili. Inseriremo i fondi sul tuo IBAN.</div>
          </div>
          <Button onClick={() => setShowForm(true)} size="lg"><Send className="h-4 w-4 mr-2" />Richiedi payout</Button>
        </Card>
      )}

      {balance && balance.pendingRequestCents > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            Hai <span className="font-semibold ml-1 mr-1">{fmt(balance.pendingRequestCents, curr)}</span> in richieste in attesa di approvazione.
          </div>
        </Card>
      )}

      {showForm && (
        <Card className="p-6 space-y-4">
          <div className="font-semibold">Nuova richiesta di payout</div>
          <div>
            <Label>Importo (EUR)</Label>
            <Input className="mt-1" type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} max={balance ? (balance.availableCents / 100).toFixed(2) : undefined} />
            <p className="text-xs text-muted-foreground mt-1">Massimo {balance ? fmt(balance.availableCents, curr) : "—"}</p>
          </div>
          <div>
            <Label>Intestatario IBAN</Label>
            <Input className="mt-1" value={ibanHolder} onChange={(e) => setIbanHolder(e.target.value)} />
          </div>
          <div>
            <Label>IBAN</Label>
            <Input className="mt-1 font-mono" placeholder="IT60X0542811101000000123456" value={iban} onChange={(e) => setIban(e.target.value)} />
            <p className="text-xs text-muted-foreground mt-1">Senza spazi, formato internazionale</p>
          </div>
          <div>
            <Label>Note (opzionale)</Label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>Annulla</Button>
            <Button onClick={() => createMut.mutate()} disabled={createMut.isPending}>
              {createMut.isPending ? "Invio..." : "Invia richiesta"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-5 border-b">
          <div className="font-semibold">Storico richieste</div>
          <div className="text-xs text-muted-foreground mt-0.5">Tutte le richieste di payout effettuate</div>
        </div>
        {listQ.isLoading && <div className="p-5 space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}</div>}
        {listQ.data && listQ.data.length === 0 && (
          <div className="p-10 text-center">
            <Receipt className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h2 className="font-semibold">Nessuna richiesta</h2>
            <p className="text-sm text-muted-foreground mt-1">Non hai ancora richiesto payout.</p>
          </div>
        )}
        {listQ.data && listQ.data.length > 0 && (
          <div className="divide-y">
            {listQ.data.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-3 hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold tabular-nums">{fmt(p.amountCents, p.currency)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">
                    IBAN <span className="font-mono">{p.iban}</span> · {new Date(p.requestedAt).toLocaleString("it-IT")}
                  </div>
                  {p.adminNotes && <div className="text-xs text-muted-foreground mt-1 italic">"{p.adminNotes}"</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

interface KpiProps { label: string; value: string; icon: typeof Wallet; bg: string; color: string; highlight?: boolean }
function KpiCard({ label, value, icon: Icon, bg, color, highlight }: KpiProps): JSX.Element {
  return (
    <Card className={`p-5 ${highlight ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-muted-foreground">{label}</div>
          <div className={`mt-1.5 text-2xl font-bold tracking-tight ${highlight ? "text-primary" : ""}`}>{value}</div>
        </div>
        <div className={`rounded-md p-2 ${bg}`}><Icon className={`h-4 w-4 ${color}`} /></div>
      </div>
    </Card>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/payouts",
  component: PayoutsPage,
});
