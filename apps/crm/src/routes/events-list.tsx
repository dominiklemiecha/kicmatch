import { useQuery } from "@tanstack/react-query";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import type { EventResponse } from "@kicmatch/shared";
import { Calendar, MapPin, Plus } from "lucide-react";
import { listEvents } from "@/features/events/events-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

function StatusBadge({ status }: { status: EventResponse["status"] }): JSX.Element {
  const styles: Record<EventResponse["status"], string> = {
    DRAFT: "bg-amber-100 text-amber-700",
    PUBLISHED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  const labels: Record<EventResponse["status"], string> = {
    DRAFT: "Bozza",
    PUBLISHED: "Pubblicato",
    CLOSED: "Chiuso",
    CANCELLED: "Annullato",
  };
  return <span className={cn("text-xs font-medium px-2.5 py-0.5 rounded-full", styles[status])}>{labels[status]}</span>;
}

function formatItalianDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

function EventCard({ event }: { event: EventResponse }): JSX.Element {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {event.coverImageUrl ? (
          <div className="h-32 sm:h-auto sm:w-48 bg-muted shrink-0">
            <img src={event.coverImageUrl} alt={event.name} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-32 sm:h-auto sm:w-48 bg-gradient-to-br from-primary/30 to-pink-300 shrink-0" />
        )}
        <div className="flex-1 p-4 sm:p-5 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-lg leading-tight">{event.name}</h3>
            <StatusBadge status={event.status} />
          </div>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              {formatItalianDate(event.startAt)}
            </div>
            {(event.locationName || event.onlineUrl) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {event.locationType === "ONLINE" ? "Online" : event.locationName}
              </div>
            )}
          </div>
          <div className="mt-auto pt-3">
            <Link to="/events/$id" params={{ id: event.id }}>
              <Button variant="outline" size="sm">Apri</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EventsListPage(): JSX.Element {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["events"], queryFn: listEvents });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventi</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestisci e crea i tuoi eventi</p>
        </div>
        <Button size="lg" onClick={() => void navigate({ to: "/events/new" })}>
          <Plus className="h-4 w-4" />
          Crea evento
        </Button>
      </div>

      {query.isLoading && (
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {query.isError && (
        <Card className="p-6 text-center text-sm text-destructive">
          Errore nel caricamento eventi.
        </Card>
      )}

      {query.data && query.data.length === 0 && (
        <Card className="p-10 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Nessun evento ancora</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-5">Crea il tuo primo evento in pochi semplici passi.</p>
          <Button onClick={() => void navigate({ to: "/events/new" })}>
            <Plus className="h-4 w-4" />
            Crea il tuo primo evento
          </Button>
        </Card>
      )}

      {query.data && query.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {query.data.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/events",
  component: EventsListPage,
});
