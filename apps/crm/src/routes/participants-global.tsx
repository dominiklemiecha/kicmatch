import { useQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { Mail, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Route as RootRoute } from "./__root";

interface GlobalParticipant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  event: { id: string; name: string };
}

async function listAllParticipants(): Promise<GlobalParticipant[]> {
  const res = await api.get<GlobalParticipant[]>("/dashboard/participants");
  return res.data;
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  CONFIRMED: { label: "Confermato", bg: "bg-green-100", color: "text-green-700" },
  PAID: { label: "Pagato", bg: "bg-emerald-100", color: "text-emerald-700" },
  PENDING_PAYMENT: { label: "In attesa", bg: "bg-orange-100", color: "text-orange-700" },
  CANCELLED: { label: "Annullato", bg: "bg-gray-100", color: "text-gray-700" },
  REJECTED: { label: "Rifiutato", bg: "bg-red-100", color: "text-red-700" },
};

function ParticipantsGlobalPage(): JSX.Element {
  const q = useQuery({ queryKey: ["participants-global"], queryFn: listAllParticipants });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Partecipanti</h1>
        <p className="text-muted-foreground text-sm mt-1">Tutti i partecipanti dei tuoi eventi</p>
      </div>
      {(!q.data || q.data.length === 0) ? (
        <Card className="p-10 text-center">
          <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-semibold">Nessun partecipante</h2>
          <p className="text-sm text-muted-foreground mt-1">Quando avrai iscritti li vedrai qui.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {q.data.map((p) => {
              const meta = STATUS_LABEL[p.status] ?? { label: p.status, bg: "bg-muted", color: "text-muted-foreground" };
              return (
                <div key={p.id} className="flex items-center gap-3 p-4 hover:bg-muted/30">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{p.firstName} {p.lastName}</span>
                      <span className={`text-[10px] uppercase font-medium px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>
                      <Link to="/events/$id" params={{ id: p.event.id }} className="text-primary hover:underline">{p.event.name}</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/participants",
  component: ParticipantsGlobalPage,
});
