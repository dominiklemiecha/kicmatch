import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute, Link, useParams } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Ban, Calendar, CheckCircle2, CreditCard } from "lucide-react";
import { useState } from "react";
import { getAdminUser, setUserBlocked, updateUserSubscription } from "@/features/admin/admin-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Route as RootRoute } from "./__root";

function fmt(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function AdminUserDetailPage(): JSX.Element {
  const { id } = useParams({ strict: false }) as { id: string };
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-user", id], queryFn: () => getAdminUser(id), enabled: Boolean(id) });

  const blockMut = useMutation({
    mutationFn: (vars: { blocked: boolean; reason?: string }) => setUserBlocked(id, vars.blocked, vars.reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-user", id] }),
  });
  const subMut = useMutation({
    mutationFn: (vars: { subscriptionStartAt?: string | null; subscriptionEndAt?: string | null }) => updateUserSubscription(id, vars),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-user", id] }),
  });

  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [blockReason, setBlockReason] = useState("");
  const [showBlock, setShowBlock] = useState(false);

  if (!q.data) return <div className="h-64 rounded-lg bg-muted animate-pulse" />;
  const d = q.data;

  return (
    <div className="space-y-6">
      <Link to="/admin/users" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Tutti gli organizzatori
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{d.user.firstName} {d.user.lastName}</h1>
            {d.user.isBlocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2.5 py-1 text-xs font-semibold">
                <Ban className="h-3 w-3" /> Bloccato
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">{d.user.email} · {d.user.profileType} · {d.user.plan} PLAN</p>
        </div>
        <div className="flex gap-2">
          {d.user.isBlocked ? (
            <Button variant="outline" onClick={() => blockMut.mutate({ blocked: false })} disabled={blockMut.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Sblocca
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setShowBlock(true)}>
              <Ban className="h-4 w-4 mr-1" /> Blocca account
            </Button>
          )}
        </div>
      </div>

      {showBlock && !d.user.isBlocked && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-red-800">Conferma blocco account</div>
              <p className="text-sm text-red-700 mt-1">L'utente non potrà più accedere al CRM. Inserisci una motivazione (visibile solo a noi).</p>
              <textarea
                className="mt-3 w-full rounded-md border border-red-300 px-3 py-2 text-sm bg-white"
                rows={2}
                placeholder="Es. Mancato pagamento abbonamento"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
              <div className="mt-3 flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    blockMut.mutate({ blocked: true, reason: blockReason || undefined });
                    setShowBlock(false);
                    setBlockReason("");
                  }}
                  disabled={blockMut.isPending}
                >
                  Conferma blocco
                </Button>
                <Button variant="outline" onClick={() => { setShowBlock(false); setBlockReason(""); }}>Annulla</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {d.user.isBlocked && d.user.blockedReason && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="text-xs font-semibold uppercase text-red-700">Motivazione blocco</div>
          <p className="mt-1 text-sm text-red-800">{d.user.blockedReason}</p>
          <p className="mt-1 text-xs text-red-700/80">Bloccato il {fmtDate(d.user.blockedAt)}</p>
        </Card>
      )}

      {/* Subscription */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Abbonamento</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Registrato il</div>
            <div className="text-sm font-medium mt-1">{fmtDate(d.user.createdAt)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Data sottoscrizione</div>
            <div className="text-sm font-medium mt-1">{fmtDate(d.user.subscriptionStartAt)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Data termine</div>
            <div className="text-sm font-medium mt-1">{fmtDate(d.user.subscriptionEndAt)}</div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <Label className="text-xs">Aggiorna inizio</Label>
            <Input type="date" value={start || toDateInput(d.user.subscriptionStartAt)} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Aggiorna fine</Label>
            <Input type="date" value={end || toDateInput(d.user.subscriptionEndAt)} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Button
            onClick={() => subMut.mutate({
              subscriptionStartAt: start ? new Date(start).toISOString() : (toDateInput(d.user.subscriptionStartAt) ? new Date(toDateInput(d.user.subscriptionStartAt)).toISOString() : null),
              subscriptionEndAt: end ? new Date(end).toISOString() : (toDateInput(d.user.subscriptionEndAt) ? new Date(toDateInput(d.user.subscriptionEndAt)).toISOString() : null),
            })}
            disabled={subMut.isPending}
          >
            Salva
          </Button>
        </div>
      </Card>

      {/* Payout stats */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Statistiche payout</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Totale richieste</div>
            <div className="text-lg font-bold mt-1">{d.payoutStats.count}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Prima richiesta</div>
            <div className="text-sm font-medium mt-1">{fmtDate(d.payoutStats.firstAt)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ultima richiesta</div>
            <div className="text-sm font-medium mt-1">{fmtDate(d.payoutStats.lastAt)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Frequenza media</div>
            <div className="text-sm font-medium mt-1">{d.payoutStats.avgIntervalDays !== null ? `${d.payoutStats.avgIntervalDays} gg` : "—"}</div>
          </div>
        </div>
      </Card>

      {/* Financials */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Incassato</div><div className="text-lg font-bold mt-1">{fmt(d.financials.totalCollectedCents)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Commissioni</div><div className="text-lg font-bold mt-1">{fmt(d.financials.totalFeesCents)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Già liquidato</div><div className="text-lg font-bold mt-1">{fmt(d.financials.totalPaidOutCents)}</div></Card>
        <Card className="p-4 border-primary/30 bg-primary/5"><div className="text-xs text-muted-foreground">Disponibile</div><div className="text-lg font-bold mt-1 text-primary">{fmt(d.financials.availableCents)}</div></Card>
      </div>

      <Card>
        <div className="p-4 border-b font-semibold">Eventi ({d.events.length})</div>
        <div className="divide-y">
          {d.events.map((e) => (
            <div key={e.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{e.name}</div>
                <div className="text-xs text-muted-foreground">{new Date(e.startAt).toLocaleDateString("it-IT")} · {e.status}</div>
              </div>
              <div className="text-sm tabular-nums shrink-0">{e.isPaid && e.priceCents ? fmt(e.priceCents, e.currency) : "Gratuito"}</div>
            </div>
          ))}
          {d.events.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Nessun evento</div>}
        </div>
      </Card>

      <Card>
        <div className="p-4 border-b font-semibold">Richieste payout ({d.payouts.length})</div>
        <div className="divide-y">
          {d.payouts.map((p) => (
            <div key={p.id} className="p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-xs truncate">{p.iban}</div>
                <div className="text-xs text-muted-foreground">{new Date(p.requestedAt).toLocaleDateString("it-IT")} · {p.status}</div>
              </div>
              <div className="text-sm font-semibold shrink-0">{fmt(p.amountCents, p.currency)}</div>
            </div>
          ))}
          {d.payouts.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">Nessuna richiesta</div>}
        </div>
      </Card>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/admin/users/$id",
  component: AdminUserDetailPage,
});
