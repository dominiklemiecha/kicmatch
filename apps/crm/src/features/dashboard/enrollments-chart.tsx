import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DATA = [
  { date: "1 Mag", v: 80 },
  { date: "8 Mag", v: 140 },
  { date: "15 Mag", v: 110 },
  { date: "22 Mag", v: 220 },
  { date: "29 Mag", v: 180 },
  { date: "6 Giu", v: 290 },
  { date: "13 Giu", v: 312 },
];

export function EnrollmentsChart(): JSX.Element {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Andamento iscrizioni</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                cursor={{ stroke: "#7c3aed", strokeDasharray: "3 3" }}
              />
              <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2} fill="url(#enrollGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
