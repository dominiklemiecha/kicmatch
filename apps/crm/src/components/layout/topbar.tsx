import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCircle2, CreditCard, LogOut, Mail, Menu, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { SidebarNav } from "@/components/layout/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logoutRequest } from "@/features/auth/auth-api";
import { useAuthStore } from "@/features/auth/auth-store";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Activity {
  type: string;
  title: string;
  subtitle: string;
  at: string;
}

interface DashboardOverview {
  recentActivity: Activity[];
}

const NOTIF_SEEN_KEY = "kicmatch_notif_seen_at";

function activityVisuals(type: string): { icon: typeof Bell; bg: string; color: string } {
  switch (type) {
    case "PAYMENT":
      return { icon: CreditCard, bg: "bg-green-100", color: "text-green-600" };
    case "RSVP":
    case "CONFIRMED":
      return { icon: CheckCircle2, bg: "bg-purple-100", color: "text-purple-600" };
    case "INVITE":
      return { icon: Mail, bg: "bg-amber-100", color: "text-amber-700" };
    default:
      return { icon: UserPlus, bg: "bg-blue-100", color: "text-blue-600" };
  }
}

function relativeTime(iso: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return "ora";
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min} min fa`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} h fa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} g fa`;
  return new Date(iso).toLocaleDateString("it-IT");
}

export function Topbar(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState<number>(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(NOTIF_SEEN_KEY) : null;
    return raw ? Number(raw) : 0;
  });

  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  const overviewQuery = useQuery({
    queryKey: ["topbar-notifications"],
    queryFn: async (): Promise<DashboardOverview> => {
      const res = await api.get<DashboardOverview>("/dashboard/overview");
      return res.data;
    },
    refetchInterval: 60_000,
    enabled: !!user && user.role !== "SUPERADMIN",
  });

  const activities = useMemo(() => overviewQuery.data?.recentActivity ?? [], [overviewQuery.data]);
  const unreadCount = useMemo(
    () => activities.filter((a) => new Date(a.at).getTime() > lastSeenAt).length,
    [activities, lastSeenAt],
  );

  useEffect(() => {
    if (notifOpen && activities.length > 0) {
      const ts = Date.now();
      window.localStorage.setItem(NOTIF_SEEN_KEY, String(ts));
      setLastSeenAt(ts);
    }
  }, [notifOpen, activities.length]);

  const logout = useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clear();
      void navigate({ to: "/login", replace: true });
    },
  });

  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : "??";
  const fullName = user ? `${user.firstName} ${user.lastName}` : "—";

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3 md:flex-1">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Apri menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="p-6">
              <Logo />
            </div>
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notifiche" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span
                  aria-hidden
                  className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card"
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b">
              <div className="text-sm font-semibold">Notifiche</div>
              <div className="text-xs text-muted-foreground">Ultime attività del tuo account</div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {overviewQuery.isLoading ? (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">Caricamento…</div>
              ) : activities.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                  Nessuna attività recente
                </div>
              ) : (
                activities.slice(0, 8).map((a, i) => {
                  const v = activityVisuals(a.type);
                  const Icon = v.icon;
                  const isUnread = new Date(a.at).getTime() > lastSeenAt;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 border-b last:border-b-0",
                        isUnread && "bg-purple-50/50",
                      )}
                    >
                      <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center", v.bg)}>
                        <Icon className={cn("h-4 w-4", v.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium leading-snug break-words">{a.title}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{relativeTime(a.at)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1 hover:bg-accent/10 focus:outline-none">
            <Avatar>
              {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={fullName} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-sm leading-tight text-left">
              <div className="font-medium">{fullName}</div>
              <div className="text-xs text-muted-foreground">
                {user?.role === "SUPERADMIN" ? "Super Admin" : "Organizzatore"}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user?.email ?? ""}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => logout.mutate()} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Esci
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
