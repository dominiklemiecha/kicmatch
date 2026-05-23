import { useQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { Ban } from "lucide-react";
import { listAdminUsers } from "@/features/admin/admin-api";
import { Card } from "@/components/ui/card";
import { Route as RootRoute } from "./__root";

function fmt(cents: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "2-digit" });
}

function AdminUsersPage(): JSX.Element {
  const q = useQuery({ queryKey: ["admin-users"], queryFn: listAdminUsers });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organizzatori</h1>
        <p className="text-muted-foreground text-sm mt-1">Tutti gli organizzatori della piattaforma</p>
      </div>
      <Card className="overflow-hidden">
        <div className="divide-y">
          {q.data?.map((u) => (
            <Link key={u.id} to="/admin/users/$id" params={{ id: u.id }}>
              <div className={`flex items-center gap-3 p-4 hover:bg-muted/30 cursor-pointer ${u.isBlocked ? "bg-red-50/40" : ""}`}>
                <div className={`h-10 w-10 rounded-full text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0 ${u.isBlocked ? "bg-red-500" : "bg-primary"}`}>
                  {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium truncate">{u.firstName} {u.lastName}</div>
                    <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-muted px-1.5 py-0.5 text-muted-foreground shrink-0">{u.plan}</span>
                    {u.isBlocked && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-red-100 text-red-700 px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0">
                        <Ban className="h-2.5 w-2.5" /> Bloccato
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Sottoscr. {fmtDate(u.subscriptionStartAt)} → {fmtDate(u.subscriptionEndAt)}
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <div className="text-sm font-semibold tabular-nums">{u.eventsCount} eventi</div>
                  <div className="text-xs text-muted-foreground">Ricavi {fmt(u.revenueCents)} · Fee {fmt(u.feesCents)}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {u.payoutCount} payout · ult. {fmtDate(u.lastPayoutAt)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {q.isLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 p-4 animate-pulse bg-muted/30" />
          ))}
          {q.data?.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">Nessun organizzatore</div>}
        </div>
      </Card>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/admin/users",
  component: AdminUsersPage,
});
