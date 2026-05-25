import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Calendar, CreditCard, LayoutDashboard, LogOut, Mail, Menu, Settings, Shield, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { ADMIN_NAV, NAV_ITEMS } from "@/components/layout/sidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutRequest } from "@/features/auth/auth-api";
import { useAuthStore } from "@/features/auth/auth-store";
import { cn } from "@/lib/utils";

interface PrimaryItem {
  to: string;
  label: string;
  icon: typeof Calendar;
}

const PRIMARY_ORGANIZER: PrimaryItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/events", label: "Eventi", icon: Calendar },
  { to: "/participants", label: "Partecip.", icon: Users },
  { to: "/payments", label: "Pagam.", icon: CreditCard },
];

const PRIMARY_ADMIN: PrimaryItem[] = [
  { to: "/admin", label: "Admin", icon: Shield },
  { to: "/admin/users", label: "Organiz.", icon: Users },
  { to: "/admin/payouts", label: "Payout", icon: CreditCard },
];

export function MobileBottomNav(): JSX.Element {
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const role = user?.role;
  const isAdmin = role === "SUPERADMIN";

  const primary = isAdmin ? PRIMARY_ADMIN : PRIMARY_ORGANIZER;
  const allItems = isAdmin ? ADMIN_NAV : NAV_ITEMS;
  const primaryPaths = new Set(primary.map((p) => p.to));
  const secondary = allItems.filter((i) => !primaryPaths.has(i.to));

  const logout = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clear();
      setSheetOpen(false);
      void navigate({ to: "/login", replace: true });
    },
  });

  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : "??";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-16">
        {primary.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              to={item.to as any}
              activeOptions={{ exact: item.to === "/admin" || item.to === "/dashboard" }}
              activeProps={{ className: "text-primary" }}
              className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
            >
              <Icon className="h-5 w-5" />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </Link>
          );
        })}
        {/* Fill empty cells if primary < 4 */}
        {Array.from({ length: Math.max(0, 4 - primary.length) }).map((_, i) => (
          <span key={`spacer-${i}`} />
        ))}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                sheetOpen ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Menu className="h-5 w-5" />
              <span>Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="h-[70vh] rounded-t-2xl p-0 flex flex-col"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="px-5 pt-5 pb-3 border-b flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.firstName} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <SheetTitle className="text-base truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "Menu"}
                </SheetTitle>
                <div className="text-xs text-muted-foreground truncate">
                  {isAdmin ? "Super Admin" : "Organizzatore"} · {user?.email ?? ""}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-2 mb-1">
                Tutto il menu
              </div>
              <div className="space-y-0.5">
                {allItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      to={item.to as any}
                      onClick={() => setSheetOpen(false)}
                      activeOptions={{ exact: item.to === "/admin" || item.to === "/dashboard" }}
                      activeProps={{ className: "bg-primary/10 text-primary" }}
                      className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-foreground hover:bg-accent/10"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="border-t px-3 py-3">
              <button
                type="button"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
                className="w-full flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/5"
              >
                <LogOut className="h-5 w-5" />
                <span>Esci</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
