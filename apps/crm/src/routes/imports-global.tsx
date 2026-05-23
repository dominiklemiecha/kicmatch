import { useQuery } from "@tanstack/react-query";
import { createRoute, Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { listEvents } from "@/features/events/events-api";
import { Card } from "@/components/ui/card";
import { Route as RootRoute } from "./__root";

function ImportsGlobalPage(): JSX.Element {
  const q = useQuery({ queryKey: ["events"], queryFn: listEvents });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importazioni</h1>
        <p className="text-muted-foreground text-sm mt-1">Le importazioni CSV si fanno dentro alla tab Inviti di ciascun evento</p>
      </div>
      <Card className="p-5 bg-muted/30 border-dashed">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Upload className="h-5 w-5" /></div>
          <div>
            <div className="font-semibold">Come importare i partecipanti</div>
            <p className="text-sm text-muted-foreground mt-1">Vai nella tab <strong>Inviti</strong> di un evento e usa il pulsante &quot;Importa CSV&quot; per caricare una lista di invitati in bulk.</p>
          </div>
        </div>
      </Card>
      {(!q.data || q.data.length === 0) ? (
        <Card className="p-10 text-center">
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-semibold">Nessun evento</h2>
          <p className="text-sm text-muted-foreground mt-1">Crea un evento per importare partecipanti via CSV</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {q.data.map((e) => (
            <Link key={e.id} to="/events/$id/inviti" params={{ id: e.id }} className="block">
              <Card className="p-5 hover:border-primary transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Upload className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <div className="font-semibold">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(e.startAt).toLocaleDateString("it-IT")} · Vai agli Inviti</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/imports",
  component: ImportsGlobalPage,
});
