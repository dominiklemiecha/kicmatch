import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { Calendar, MapPin, Pencil, Sparkles, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { getEvent, publishEvent } from "@/features/events/events-api";
import { listInvitations } from "@/features/events/invitations-api";
import { EventWizardShell } from "@/features/events/event-wizard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Route as RootRoute } from "./__root";

function formatPrice(cents: number | null, currency: string): string {
  if (cents === null) return "—";
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);
}

function EventRiepilogoPage(): JSX.Element {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const qc = useQueryClient();
  const ev = useQuery({ queryKey: ["event", id], queryFn: () => getEvent(id), enabled: Boolean(id) });
  const invites = useQuery({ queryKey: ["invitations", id], queryFn: () => listInvitations(id), enabled: Boolean(id) });

  const publishMut = useMutation({
    mutationFn: () => publishEvent(id),
    onSuccess: (published) => {
      qc.setQueryData(["event", id], published);
      void qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento pubblicato!");
      void navigate({ to: "/events/$id/pubblicato", params: { id }, replace: true });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Errore pubblicazione");
    },
  });

  if (!ev.data) return <div className="h-64 rounded-lg bg-muted animate-pulse" />;
  const e = ev.data;
  const inviteCount = invites.data?.filter((i) => i.email).length ?? 0;
  const totalRevenue = e.isPaid && e.priceCents && e.capacity ? (e.priceCents * e.capacity) / 100 : null;

  return (
    <EventWizardShell
      eventId={id}
      currentStep={5}
      title="Riepilogo evento"
      subtitle="Controlla e pubblica il tuo evento"
    >
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {e.coverImageUrl ? (
            <div className="h-40 sm:h-auto sm:w-48 shrink-0 bg-muted">
              <img src={e.coverImageUrl} alt={e.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div className="h-40 sm:h-auto sm:w-48 shrink-0 bg-gradient-to-br from-primary/30 to-pink-300" />
          )}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold">{e.name}</h2>
              <button
                onClick={() => void navigate({ to: "/events/new" })}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Modifica"
                title="Modifica"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(e.startAt).toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" })}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                {e.locationType === "ONLINE" ? "Online" : e.locationName ?? "—"}
              </div>
            </div>
            <div className="mt-3">
              <span
                className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  e.isPaid ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {e.isPaid ? `A pagamento · ${formatPrice(e.priceCents, e.currency)}` : "Gratuito"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t grid grid-cols-2 sm:grid-cols-4 divide-x">
          <SummaryCell icon={Users} label="Invitati" value={inviteCount} />
          <SummaryCell icon={Sparkles} label="Modulo" value="base" />
          <SummaryCell icon={Users} label="Posti disponibili" value={e.capacity ?? "Illimitati"} />
          <SummaryCell
            icon={Calendar}
            label="Scadenza"
            value={e.rsvpDeadline ? new Date(e.rsvpDeadline).toLocaleDateString("it-IT") : "—"}
          />
        </div>

        {totalRevenue !== null && (
          <div className="border-t bg-gradient-to-r from-primary/5 to-pink-100/40 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Totale previsto</div>
                <div className="text-2xl font-bold mt-1">
                  {new Intl.NumberFormat("it-IT", { style: "currency", currency: e.currency }).format(totalRevenue)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ({e.capacity ?? 0} posti × {formatPrice(e.priceCents, e.currency)})
                </div>
              </div>
              <Wallet className="h-8 w-8 text-primary/50" />
            </div>
          </div>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
        <Button variant="ghost" onClick={() => void navigate({ to: "/events/$id/biglietti", params: { id } })}>
          Indietro
        </Button>
        <Button size="lg" onClick={() => publishMut.mutate()} disabled={publishMut.isPending}>
          {publishMut.isPending ? "Pubblicazione..." : "Pubblica evento"}
        </Button>
      </div>
    </EventWizardShell>
  );
}

function SummaryCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}): JSX.Element {
  return (
    <div className="p-4 text-center">
      <Icon className="h-4 w-4 mx-auto text-muted-foreground" />
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      <div className="text-sm font-semibold mt-0.5">{value}</div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/events/$id/riepilogo",
  component: EventRiepilogoPage,
});
