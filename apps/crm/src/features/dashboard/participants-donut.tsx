import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DATA = [
  { name: "Confermati", value: 312, color: "#7c3aed" },
  { name: "Pagati", value: 256, color: "#ec4899" },
  { name: "In attesa", value: 80, color: "#fb923c" },
  { name: "Rifiutati", value: 15, color: "#94a3b8" },
];

export function ParticipantsDonut(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stato partecipanti</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
          <div className="h-40 w-40 shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={DATA} dataKey="value" innerRadius={48} outerRadius={70} paddingAngle={2} stroke="none">
                  {DATA.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex-1 space-y-2 text-sm w-full">
            {DATA.map((d) => (
              <li key={d.name} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold tabular-nums">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
