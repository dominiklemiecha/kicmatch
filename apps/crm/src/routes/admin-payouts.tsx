import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { CheckCircle2, Mail, Receipt, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { listAdminPayouts, markAdminPayout, type AdminPayoutItem } from "@/features/admin/admin-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

function fmt(cents: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);
}

type Filter = "ALL" | "PENDING" | "PAID" | "REJECTED";

function AdminPayoutsPage(): JSX.Element {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("PENDING");
  const q = useQuery({ queryKey: ["admin-payouts", filter], queryFn: () => listAdminPayouts(filter === "ALL" ? undefined : filter) });

  const markMut = useMutation({
    mutationFn: (vars: { id: string; status: "PAID" | "REJECTED"; note?: string }) => markAdminPayout(vars.id, vars.status, vars.note),
    onSuccess: () => {
      toast.success("Stato aggiornato");
      void qc.invalidateQueries({ queryKey: ["admin-payouts"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: AxiosError<{ message?: string }>) => toast.error(e.response?.data?.message ?? "Errore"),
  });

  const filters: { value: Filter; label: string }[] = [
    { value: "PENDING", label: "In attesa" },
    { value: "PAID", label: "Pagate" },
    { value: "REJECTED", label: "Rifiutate" },
    { value: "ALL", label: "Tutte" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Richieste di payout</h1>
        <p className="text-muted-foreground text-sm mt-1">Approva, paga o rifiuta le richieste degli organizzatori</p>
      </div>
      <div className="flex gap-1 overflow-x-auto">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)} className={cn("px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap", filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70")}>
            {f.label}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        {q.isLoading && (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded bg-muted animate-pulse" />)}
          </div>
        )}
        {q.data && q.data.length === 0 && (
          <div className="p-10 text-center">
            <Receipt className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h2 className="font-semibold">Nessuna richiesta</h2>
          </div>
        )}
        {q.data && q.data.length > 0 && (
          <div className="divide-y">
            {q.data.map((p) => <PayoutRow key={p.id} p={p} onMark={(status, note) => markMut.mutate({ id: p.id, status, note })} />)}
          </div>
        )}
      </Card>
    </div>
  );
}

function PayoutRow({ p, onMark }: { p: AdminPayoutItem; onMark: (status: "PAID" | "REJECTED", note?: string) => void }): JSX.Element {
  const [note, setNote] = useState("");
  const statusBg = p.status === "PAID" ? "bg-emerald-100 text-emerald-700" : p.status === "REJECTED" ? "bg-red-100 text-red-700" : p.status === "APPROVED" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="font-semibold flex items-center gap-2 flex-wrap">
            {p.user.firstName} {p.user.lastName}
            <span className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded-full ${statusBg}`}>{p.status}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Mail className="h-3 w-3" />{p.user.email}</div>
          <div className="text-xs text-muted-foreground mt-1">{new Date(p.requestedAt).toLocaleString("it-IT")}</div>
          {p.notes && <div className="text-xs text-muted-foreground italic mt-1">"{p.notes}"</div>}
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tabular-nums">{fmt(p.amountCents, p.currency)}</div>
        </div>
      </div>
      <div className="rounded-md bg-muted/30 border p-3 text-xs">
        <div><span className="text-muted-foreground">Intestatario:</span> <span className="font-medium ml-1">{p.ibanHolder}</span></div>
        <div className="mt-1"><span className="text-muted-foreground">IBAN:</span> <span className="font-mono break-all ml-1">{p.iban}</span></div>
      </div>
      {p.status === "PENDING" && (
        <div className="space-y-2">
          <input type="text" placeholder="Nota interna (opzionale, es. ID bonifico)" value={note} onChange={(e) => setNote(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onMark("REJECTED", note || undefined)}><XCircle className="h-4 w-4 mr-1" />Rifiuta</Button>
            <Button size="sm" onClick={() => onMark("PAID", note || undefined)}><CheckCircle2 className="h-4 w-4 mr-1" />Marca pagata</Button>
          </div>
        </div>
      )}
      {p.adminNotes && <div className="text-xs text-muted-foreground italic">Nota admin: "{p.adminNotes}"</div>}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/admin/payouts",
  component: AdminPayoutsPage,
});
