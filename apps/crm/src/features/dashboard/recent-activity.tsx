import { CheckCircle2, CreditCard, Mail, UserPlus, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Activity {
  icon: LucideIcon;
  bg: string;
  color: string;
  title: string;
  time: string;
}

const ACTIVITIES: Activity[] = [
  { icon: UserPlus, bg: "bg-purple-100", color: "text-purple-600", title: "Nuova iscrizione a KIC Motorsports Day", time: "2 min fa" },
  { icon: CreditCard, bg: "bg-green-100", color: "text-green-600", title: "Pagamento ricevuto da Luca Bianchi", time: "8 min fa" },
  { icon: CheckCircle2, bg: "bg-purple-100", color: "text-purple-600", title: "Marco Verdi ha confermato la partecipazione", time: "12 min fa" },
  { icon: Mail, bg: "bg-purple-100", color: "text-purple-600", title: "Invio invito per Dinner Experience", time: "20 min fa" },
];

export function RecentActivity(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Attività recenti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ACTIVITIES.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex gap-3">
              <div className={cn("h-8 w-8 shrink-0 rounded-full flex items-center justify-center", a.bg)}>
                <Icon className={cn("h-4 w-4", a.color)} />
              </div>
              <div className="text-sm leading-tight">
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.time}</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
