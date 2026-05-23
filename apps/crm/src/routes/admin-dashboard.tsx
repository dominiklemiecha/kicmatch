import { useQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { Calendar, CreditCard, Receipt, Send, TrendingUp, Users } from "lucide-react";
import { getAdminStats } from "@/features/admin/admin-api";
import { Card } from "@/components/ui/card";
import { Route as RootRoute } from "./__root";

function fmt(cents: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function AdminDashboardPage(): JSX.Element {
  const q = useQuery({ queryKey: ["admin-stats"], queryFn: getAdminStats });
  const data = q.data;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
        <p className="text-muted-foreground text-sm mt-1">Stato della piattaforma Kicmatch</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminKpi label="Organizzatori" value={data?.users.toString() ?? "—"} icon={Users} bg="bg-purple-100" color="text-purple-600" />
        <AdminKpi label="Eventi creati" value={data?.events.toString() ?? "—"} icon={Calendar} bg="bg-blue-100" color="text-blue-600" />
        <AdminKpi label="Partecipanti totali" value={data?.participants.toString() ?? "—"} icon={Users} bg="bg-emerald-100" color="text-emerald-600" />
        <AdminKpi label="Volume transato" value={data ? fmt(data.revenueCents) : "—"} icon={CreditCard} bg="bg-pink-100" color="text-pink-600" />
        <AdminKpi label="Commissioni guadagnate" value={data ? fmt(data.feesCents) : "—"} icon={TrendingUp} bg="bg-amber-100" color="text-amber-600" highlight />
        <AdminKpi label="Payout in attesa" value={data ? fmt(data.pendingPayoutCents) : "—"} icon={Send} bg="bg-red-100" color="text-red-600" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/users">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <Users className="h-8 w-8 text-primary mb-2" />
            <div className="font-semibold">Organizzatori</div>
            <p className="text-sm text-muted-foreground mt-1">Lista, eventi, ricavi, commissioni</p>
          </Card>
        </Link>
        <Link to="/admin/payouts">
          <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
            <Receipt className="h-8 w-8 text-primary mb-2" />
            <div className="font-semibold">Richieste di payout</div>
            <p className="text-sm text-muted-foreground mt-1">Approva, paga o rifiuta le richieste</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}

interface AdminKpiProps { label: string; value: string; icon: typeof Users; bg: string; color: string; highlight?: boolean }
function AdminKpi({ label, value, icon: Icon, bg, color, highlight }: AdminKpiProps): JSX.Element {
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
  path: "/admin",
  component: AdminDashboardPage,
});
