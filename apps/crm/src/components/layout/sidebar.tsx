import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Calendar, CreditCard, LayoutDashboard, Mail, Settings, Shield, Users, Wallet } from "lucide-react";
import { useAuthStore } from "@/features/auth/auth-store";
import { getAdminStats } from "@/features/admin/admin-api";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/events", label: "I miei eventi", icon: Calendar },
  { to: "/participants", label: "Partecipanti", icon: Users },
  { to: "/invitations", label: "Inviti", icon: Mail },
  { to: "/payments", label: "Pagamenti", icon: CreditCard },
  { to: "/payouts", label: "Richiedi Payout", icon: Wallet },
  { to: "/settings", label: "Impostazioni", icon: Settings },
] as const;

const ADMIN_NAV = [
  { to: "/admin", label: "Super Admin", icon: Shield },
  { to: "/admin/users", label: "Organizzatori", icon: Users },
  { to: "/admin/payouts", label: "Payout", icon: CreditCard },
] as const;

interface SidebarProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarProps): JSX.Element {
  const role = useAuthStore((s) => s.user?.role);
  const isSuperadmin = role === "SUPERADMIN";
  const items = isSuperadmin ? ADMIN_NAV : NAV_ITEMS;
  const adminStats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    enabled: isSuperadmin,
    refetchInterval: 60000,
  });
  const pendingPayouts = adminStats.data?.pendingPayoutCount ?? 0;
  return (
    <nav className="flex-1 px-3 space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const showBadge = isSuperadmin && item.to === "/admin/payouts" && pendingPayouts > 0;
        return (
          <Link
            key={item.to}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            to={item.to as any}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-colors",
            )}
            activeOptions={{ exact: item.to === "/admin" || item.to === "/dashboard" }}
            activeProps={{ className: "bg-primary/10 text-primary" }}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {showBadge && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                {pendingPayouts}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar(): JSX.Element {
  return (
    <aside className="hidden md:flex md:w-52 md:flex-col border-r bg-card">
      <div className="px-4 py-5">
        <Logo className="h-7" />
      </div>
      <SidebarNav />
    </aside>
  );
}
