import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventResponse, UpdateEventInput } from "@kicmatch/shared";
import { AxiosError } from "axios";
import { ImagePlus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getEvent, updateEvent } from "@/features/events/events-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EventSettingsPanelProps {
  eventId: string;
}

export function EventSettingsPanel({ eventId }: EventSettingsPanelProps): JSX.Element {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["event", eventId], queryFn: () => getEvent(eventId), enabled: Boolean(eventId) });

  const [form, setForm] = useState<Partial<EventResponse>>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rsvpDate, setRsvpDate] = useState("");
  const [priceEuros, setPriceEuros] = useState("");

  useEffect(() => {
    if (!query.data) return;
    const e = query.data;
    setForm(e);
    setCoverPreview(e.coverImageUrl);
    const d = new Date(e.startAt);
    setDate(d.toISOString().slice(0, 10));
    setTime(d.toISOString().slice(11, 16));
    setRsvpDate(e.rsvpDeadline ? e.rsvpDeadline.slice(0, 10) : "");
    setPriceEuros(e.priceCents !== null ? (e.priceCents / 100).toFixed(2) : "");
  }, [query.data]);

  const mut = useMutation({
    mutationFn: (input: UpdateEventInput) => updateEvent(eventId, input),
    onSuccess: (updated) => {
      qc.setQueryData(["event", eventId], updated);
      void qc.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento aggiornato");
    },
    onError: (error: AxiosError<{ message?: string; details?: Array<{ message: string }> }>) => {
      const msg = error.response?.data?.details?.[0]?.message ?? error.response?.data?.message ?? "Errore aggiornamento";
      toast.error(msg);
    },
  });

  const handleCoverFile = (file: File): void => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setCoverPreview(url);
      setForm((f) => ({ ...f, coverImageUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (): void => {
    if (!form.name || !date || !time) {
      toast.error("Nome, data e ora sono obbligatori");
      return;
    }
    const startAt = new Date(`${date}T${time}:00`).toISOString();
    mut.mutate({
      name: form.name,
      description: form.description ?? null,
      startAt,
      locationType: form.locationType,
      locationName: form.locationType === "PHYSICAL" ? (form.locationName ?? null) : null,
      onlineUrl: form.locationType === "ONLINE" ? (form.onlineUrl ?? null) : null,
      coverImageUrl: form.coverImageUrl ?? null,
      capacity: form.capacity ?? null,
      rsvpDeadline: rsvpDate ? new Date(`${rsvpDate}T23:59:59`).toISOString() : null,
      isPaid: form.isPaid ?? false,
      priceCents: form.isPaid && priceEuros ? Math.round(parseFloat(priceEuros) * 100) : null,
    });
  };

  if (!query.data) return <div className="h-64 rounded-lg bg-muted animate-pulse" />;

  const locationType = form.locationType ?? "PHYSICAL";

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-5">
        <div className="text-sm font-semibold">Dettagli evento</div>
        <div>
          <Label>Nome evento *</Label>
          <Input className="mt-1" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label>Descrizione</Label>
          <textarea
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Data *</Label>
            <Input className="mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Ora *</Label>
            <Input className="mt-1" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tipo di evento</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, locationType: "PHYSICAL" })}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm font-medium",
                locationType === "PHYSICAL" ? "border-primary bg-primary/5 text-primary" : "border-input",
              )}
            >
              In presenza
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, locationType: "ONLINE" })}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm font-medium",
                locationType === "ONLINE" ? "border-primary bg-primary/5 text-primary" : "border-input",
              )}
            >
              Online
            </button>
          </div>
        </div>
        {locationType === "PHYSICAL" ? (
          <div>
            <Label>Luogo</Label>
            <Input className="mt-1" value={form.locationName ?? ""} onChange={(e) => setForm({ ...form, locationName: e.target.value })} />
          </div>
        ) : (
          <div>
            <Label>URL evento</Label>
            <Input className="mt-1" type="url" value={form.onlineUrl ?? ""} onChange={(e) => setForm({ ...form, onlineUrl: e.target.value })} />
          </div>
        )}
        <div className="space-y-2">
          <Label>Immagine di copertina</Label>
          <label
            htmlFor="coverFileEdit"
            className="relative flex items-center justify-center h-40 rounded-lg border-2 border-dashed border-input bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
          >
            {coverPreview ? (
              <img src={coverPreview} alt="cover" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-muted-foreground text-sm">
                <ImagePlus className="h-6 w-6 mb-2" />
                Clicca per cambiare immagine
              </div>
            )}
            <input
              id="coverFileEdit"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverFile(file);
              }}
            />
          </label>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <div className="text-sm font-semibold">Biglietti</div>
        <div className="space-y-2">
          <Label>Tipo evento</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, isPaid: false })}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm font-medium",
                !form.isPaid ? "border-primary bg-primary/5 text-primary" : "border-input",
              )}
            >
              Gratuito
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, isPaid: true })}
              className={cn(
                "flex-1 rounded-md border px-3 py-2 text-sm font-medium",
                form.isPaid ? "border-primary bg-primary/5 text-primary" : "border-input",
              )}
            >
              A pagamento
            </button>
          </div>
        </div>
        {form.isPaid && (
          <div>
            <Label>Prezzo (EUR)</Label>
            <Input className="mt-1" type="number" min="0" step="0.01" value={priceEuros} onChange={(e) => setPriceEuros(e.target.value)} />
          </div>
        )}
        <div>
          <Label>Capacity (posti massimi)</Label>
          <Input
            className="mt-1"
            type="number"
            min="1"
            value={form.capacity ?? ""}
            onChange={(e) => setForm({ ...form, capacity: e.target.value ? parseInt(e.target.value, 10) : null })}
          />
        </div>
        <div>
          <Label>Scadenza iscrizioni</Label>
          <Input className="mt-1" type="date" value={rsvpDate} onChange={(e) => setRsvpDate(e.target.value)} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={mut.isPending}>
          <Save className="h-4 w-4" />
          {mut.isPending ? "Salvataggio..." : "Salva modifiche"}
        </Button>
      </div>
    </div>
  );
}
