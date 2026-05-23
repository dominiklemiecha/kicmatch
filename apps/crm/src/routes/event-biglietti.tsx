import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getEvent, updateEvent } from "@/features/events/events-api";
import { EventWizardShell } from "@/features/events/event-wizard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

interface PMFlags { card: boolean; applePay: boolean; googlePay: boolean; bankTransfer: boolean }

function EventBigliettiPage(): JSX.Element {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["event", id], queryFn: () => getEvent(id), enabled: Boolean(id) });

  const [isPaid, setIsPaid] = useState(false);
  const [priceEuros, setPriceEuros] = useState("");
  const [capacity, setCapacity] = useState("");
  const [rsvpDate, setRsvpDate] = useState("");
  const [pm, setPm] = useState<PMFlags>({ card: true, applePay: true, googlePay: true, bankTransfer: false });

  useEffect(() => {
    if (!query.data) return;
    setIsPaid(query.data.isPaid);
    setPriceEuros(query.data.priceCents !== null ? (query.data.priceCents / 100).toFixed(2) : "");
    setCapacity(query.data.capacity !== null ? String(query.data.capacity) : "");
    setRsvpDate(query.data.rsvpDeadline ? query.data.rsvpDeadline.slice(0, 10) : "");
    const m = (query.data.paymentMethods as PMFlags | null) ?? null;
    if (m && typeof m === "object") {
      setPm({
        card: (m as PMFlags).card ?? true,
        applePay: (m as PMFlags).applePay ?? true,
        googlePay: (m as PMFlags).googlePay ?? true,
        bankTransfer: (m as PMFlags).bankTransfer ?? false,
      });
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: () =>
      updateEvent(id, {
        isPaid,
        priceCents: isPaid && priceEuros ? Math.round(parseFloat(priceEuros) * 100) : null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        rsvpDeadline: rsvpDate ? new Date(`${rsvpDate}T23:59:59`).toISOString() : null,
        paymentMethods: pm,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["event", id] });
      void navigate({ to: "/events/$id/riepilogo", params: { id } });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Errore salvataggio");
    },
  });

  return (
    <EventWizardShell
      eventId={id}
      currentStep={4}
      title="Biglietti e pagamenti"
      subtitle="Imposta prezzo e modalità di pagamento"
    >
      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <Label>Tipo di evento</Label>
          <div className="space-y-2">
            <TypeRow title="Evento gratuito" selected={!isPaid} onClick={() => setIsPaid(false)} />
            <TypeRow title="Evento a pagamento" selected={isPaid} onClick={() => setIsPaid(true)} />
          </div>
        </div>

        {isPaid && (
          <div>
            <Label htmlFor="price">Prezzo biglietto</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="120,00"
                value={priceEuros}
                onChange={(e) => setPriceEuros(e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">EUR</span>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="capacity">Numero massimo partecipanti</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            placeholder="400"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="rsvpDate">Scadenza iscrizioni</Label>
          <Input
            id="rsvpDate"
            type="date"
            value={rsvpDate}
            onChange={(e) => setRsvpDate(e.target.value)}
            className="mt-2"
          />
        </div>

        {isPaid && (
          <div className="space-y-2">
            <Label>Metodo di pagamento</Label>
            <div className="rounded-md border bg-primary/5 border-primary/30 p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-white border flex items-center justify-center shrink-0">
                <svg viewBox="0 0 60 25" className="h-4 w-auto" fill="#635bff" aria-label="Stripe">
                  <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.14l.01 5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.58-.24 1.58-1C6.31 13.83 0 14.42 0 9.84 0 6.92 2.15 5.2 5.49 5.2c1.32 0 2.86.2 4.16.7v3.88a9.35 9.35 0 0 0-4.17-1.08c-.86 0-1.39.25-1.39.92 0 1.68 6.36.88 6.36 5.99z" fillRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Stripe</div>
                <div className="text-xs text-muted-foreground">Carta di credito, Apple Pay e Google Pay tramite Stripe.</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 pt-2">
          <Button variant="ghost" onClick={() => void navigate({ to: "/events/$id/modulo", params: { id } })}>Indietro</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Salvataggio..." : "Continua"}
          </Button>
        </div>
      </Card>
    </EventWizardShell>
  );
}

function TypeRow({ title, selected, onClick }: { title: string; selected: boolean; onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-3 p-3 rounded-md border text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-input hover:bg-accent/5",
      )}
    >
      <span className="font-medium text-sm">{title}</span>
      <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", selected ? "border-primary bg-primary" : "border-muted-foreground/30")}>
        {selected && <div className="h-2.5 w-2.5 rounded-full bg-primary-foreground" />}
      </div>
    </button>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }): JSX.Element {
  return (
    <label className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 cursor-pointer">
      <span className="text-sm">{label}</span>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
          checked ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow-lg ring-0 transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
    </label>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/events/$id/biglietti",
  component: EventBigliettiPage,
});
