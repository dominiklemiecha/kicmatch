import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import type { FieldDef, FieldType } from "@kicmatch/shared";
import { AxiosError } from "axios";
import { ArrowDown, ArrowUp, Building2, ChevronDown, Hash, List, Mail, Phone, Plus, Type, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EventWizardShell } from "@/features/events/event-wizard-shell";
import { getEventForm, putEventForm } from "@/features/events/events-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

interface CatalogItem {
  type: FieldType;
  label: string;
  icon: typeof User;
  defaultRequired: boolean;
  builtIn: boolean;
}

const CATALOG: CatalogItem[] = [
  { type: "FIRST_LAST_NAME", label: "Nome e cognome", icon: User, defaultRequired: true, builtIn: true },
  { type: "EMAIL", label: "Email", icon: Mail, defaultRequired: true, builtIn: true },
  { type: "PHONE", label: "Telefono", icon: Phone, defaultRequired: false, builtIn: true },
  { type: "COMPANY", label: "Azienda", icon: Building2, defaultRequired: false, builtIn: true },
  { type: "SELECT", label: "Menu a scelta", icon: ChevronDown, defaultRequired: false, builtIn: false },
  { type: "SHORT_TEXT", label: "Domanda a risposta breve", icon: Type, defaultRequired: false, builtIn: false },
  { type: "MULTISELECT", label: "Domanda a risposta multipla", icon: List, defaultRequired: false, builtIn: false },
];

function generateId(): string {
  return `f_${Math.random().toString(36).slice(2, 10)}`;
}

function isBuiltIn(type: FieldType): boolean {
  return CATALOG.find((c) => c.type === type)?.builtIn ?? false;
}

function EventModuloPage(): JSX.Element {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["event-form", id], queryFn: () => getEventForm(id), enabled: Boolean(id) });

  const [fields, setFields] = useState<FieldDef[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) return;
    const incoming = (query.data.fields as FieldDef[]) ?? [];
    if (incoming.length === 0 && fields.length === 0) {
      // Seed defaults on first visit: Nome cognome + Email + Telefono + Azienda
      setFields([
        { id: generateId(), type: "FIRST_LAST_NAME", label: "Nome e cognome", required: true },
        { id: generateId(), type: "EMAIL", label: "Email", required: true },
        { id: generateId(), type: "PHONE", label: "Telefono", required: true },
        { id: generateId(), type: "COMPANY", label: "Azienda", required: false },
      ]);
    } else if (incoming.length > 0) {
      setFields(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  const addField = (type: FieldType): void => {
    const cat = CATALOG.find((c) => c.type === type);
    if (!cat) return;
    if (cat.builtIn && fields.some((f) => f.type === type)) {
      toast.info(`${cat.label} è già nel modulo`);
      return;
    }
    const newField: FieldDef = {
      id: generateId(),
      type,
      label: cat.label,
      required: cat.defaultRequired,
      ...(type === "SELECT" || type === "MULTISELECT" ? { options: ["Opzione 1", "Opzione 2"] } : {}),
    };
    setFields((arr) => [...arr, newField]);
    if (!cat.builtIn) setEditingId(newField.id);
  };

  const removeField = (fid: string): void => {
    setFields((arr) => arr.filter((f) => f.id !== fid));
    if (editingId === fid) setEditingId(null);
  };

  const moveField = (fid: string, dir: -1 | 1): void => {
    setFields((arr) => {
      const idx = arr.findIndex((f) => f.id === fid);
      if (idx < 0) return arr;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      const copy = [...arr];
      [copy[idx], copy[newIdx]] = [copy[newIdx]!, copy[idx]!];
      return copy;
    });
  };

  const updateField = (fid: string, patch: Partial<FieldDef>): void => {
    setFields((arr) => arr.map((f) => (f.id === fid ? { ...f, ...patch } : f)));
  };

  const saveMut = useMutation({
    mutationFn: () => putEventForm(id, { fields, privacyRequired: false }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["event-form", id] });
      void navigate({ to: "/events/$id/biglietti", params: { id } });
    },
    onError: (error: AxiosError<{ message?: string; details?: Array<{ message: string }> }>) => {
      const msg = error.response?.data?.details?.[0]?.message ?? error.response?.data?.message ?? "Errore salvataggio modulo";
      toast.error(msg);
    },
  });

  return (
    <EventWizardShell
      eventId={id}
      currentStep={3}
      title="Modulo di registrazione"
      subtitle="Personalizza le informazioni da raccogliere"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Catalog */}
        <Card className="p-5">
          <div className="text-sm font-semibold mb-3">Campi disponibili</div>
          <p className="text-xs text-muted-foreground mb-4">Clicca per aggiungerli al tuo modulo</p>
          <div className="space-y-2">
            {CATALOG.map((c) => {
              const Icon = c.icon;
              const alreadyAdded = c.builtIn && fields.some((f) => f.type === c.type);
              return (
                <button
                  key={c.type}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => addField(c.type)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-md border text-left transition-colors",
                    alreadyAdded ? "opacity-50 cursor-not-allowed border-input" : "border-input hover:border-primary hover:bg-primary/5",
                  )}
                >
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-sm">{c.label}</div>
                  <Plus className={cn("h-4 w-4", alreadyAdded ? "text-muted-foreground/50" : "text-primary")} />
                </button>
              );
            })}
          </div>
        </Card>

        {/* Form */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Il tuo modulo</div>
            <span className="text-xs text-muted-foreground">{fields.length} campi</span>
          </div>
          {fields.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Aggiungi i campi dalla colonna a sinistra.
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((f, i) => {
                const cat = CATALOG.find((c) => c.type === f.type);
                const Icon = cat?.icon ?? Hash;
                const editing = editingId === f.id;
                return (
                  <div key={f.id} className="rounded-md border bg-card">
                    <div className="flex items-center gap-2 p-3">
                      <div className="h-8 w-8 shrink-0 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{f.label}</div>
                      </div>
                      <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0 cursor-pointer select-none mr-1">
                        <input
                          type="checkbox"
                          checked={f.required}
                          onChange={(e) => updateField(f.id, { required: e.target.checked })}
                          className="h-3.5 w-3.5 rounded border-input accent-primary"
                        />
                        Obbligatorio
                      </label>
                      <div className="flex items-center gap-0.5 text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => moveField(f.id, -1)}
                          disabled={i === 0}
                          className="p-1.5 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Sposta su"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(f.id, 1)}
                          disabled={i === fields.length - 1}
                          className="p-1.5 hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Sposta giù"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        {!isBuiltIn(f.type) && (
                          <button
                            type="button"
                            onClick={() => setEditingId(editing ? null : f.id)}
                            className="text-xs px-2 py-1 rounded hover:bg-accent/10"
                          >
                            {editing ? "Chiudi" : "Modifica"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeField(f.id)}
                          className="p-1.5 hover:text-destructive"
                          aria-label="Rimuovi"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {editing && (
                      <div className="border-t bg-muted/30 p-3 space-y-3">
                        <div>
                          <Label htmlFor={`label-${f.id}`} className="text-xs">Etichetta</Label>
                          <Input
                            id={`label-${f.id}`}
                            value={f.label}
                            onChange={(e) => updateField(f.id, { label: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        {(f.type === "SELECT" || f.type === "MULTISELECT") && (
                          <div>
                            <Label className="text-xs">Opzioni (una per riga)</Label>
                            <textarea
                              value={(f.options ?? []).join("\n")}
                              onChange={(e) =>
                                updateField(f.id, {
                                  options: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                                })
                              }
                              rows={3}
                              className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="flex justify-between gap-2 pt-4">
        <Button variant="ghost" onClick={() => void navigate({ to: "/events/$id/inviti", params: { id } })}>Indietro</Button>
        <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || fields.length === 0}>
          {saveMut.isPending ? "Salvataggio..." : "Continua"}
        </Button>
      </div>
    </EventWizardShell>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/events/$id/modulo",
  component: EventModuloPage,
});
