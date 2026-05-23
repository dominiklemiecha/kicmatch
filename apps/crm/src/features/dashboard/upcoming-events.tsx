import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const EVENTS = [
  { name: "KIC Motorsports Day", subtitle: "24 Maggio 2024 · Monza Circuit", current: 312, capacity: 400 },
  { name: "Dinner Experience", subtitle: "8 Giugno 2024 · Milano", current: 128, capacity: 150 },
  { name: "Tech Talk: AI & Future", subtitle: "15 Giugno 2024 · Online", current: 220, capacity: 250 },
];

export function UpcomingEvents(): JSX.Element {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Prossimi eventi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {EVENTS.map((e) => {
          const pct = Math.round((e.current / e.capacity) * 100);
          return (
            <div key={e.name} className="space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.subtitle}</div>
                </div>
                <div className="text-sm tabular-nums text-muted-foreground">
                  <span className="font-semibold text-foreground">{e.current}</span> / {e.capacity}
                </div>
              </div>
              <Progress value={pct} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
