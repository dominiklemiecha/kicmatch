import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Bell, Copy, Link2, Mail, Send, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getEvent } from "@/features/events/events-api";
import { createInvitations, deleteInvitation, listInvitations, resendInvitation } from "@/features/events/invitations-api";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InvitationsPanelProps {
  eventId: string;
  className?: string;
  /** Hide the manual reminder card (it's not useful during creation, only after publish). */
  hideReminder?: boolean;
}

export function InvitationsPanel({ eventId, className, hideReminder = false }: InvitationsPanelProps): JSX.Element {
  const qc = useQueryClient();
  const [emailInput, setEmailInput] = useState("");

  const eventQuery = useQuery({ queryKey: ["event", eventId], queryFn: () => getEvent(eventId), enabled: Boolean(eventId) });
  const inviteQuery = useQuery({
    queryKey: ["invitations", eventId],
    queryFn: () => listInvitations(eventId),
    enabled: Boolean(eventId),
  });

  const createMut = useMutation({
    mutationFn: async (vars: { emails?: string[]; source: "MANUAL" | "CSV" | "LINK" }) =>
      createInvitations(eventId, { source: vars.source, emails: vars.emails ?? [] }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["invitations", eventId] });
      setEmailInput("");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Errore creazione inviti");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (invId: string) => deleteInvitation(eventId, invId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["invitations", eventId] }),
  });

  const resendMut = useMutation({
    mutationFn: (invId: string) => resendInvitation(eventId, invId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["invitations", eventId] });
      toast.success("Email inviata");
    },
    onError: () => toast.error("Errore invio email"),
  });

  const sendReminders = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ sent: number }>(`/events/${eventId}/reminders/send`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.sent > 0 ? `${data.sent} reminder inviati` : "Nessuno da promemorare");
    },
    onError: () => {
      toast.error("Errore invio reminder");
    },
  });

  const handleAddEmail = (): void => {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    const emails = trimmed.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
    createMut.mutate({ emails, source: "MANUAL" });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleCsv = async (file: File): Promise<void> => {
    const text = await file.text();
    const emails = text.split(/[\n,;]/).map((s) => s.trim()).filter((s) => /@/.test(s));
    if (emails.length === 0) {
      toast.error("Nessuna email trovata nel file");
      return;
    }
    createMut.mutate({ emails, source: "CSV" });
  };

  const handleGenerateLink = (): void => {
    createMut.mutate({ source: "LINK" });
  };

  const linkInvitation = inviteQuery.data?.find((i) => i.source === "LINK");
  const slug = eventQuery.data?.slug ?? "";
  const baseOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const publicLink = linkInvitation && slug ? `${baseOrigin}/e/${slug}?t=${linkInvitation.token}` : "";
  const emailInvites = inviteQuery.data?.filter((i) => i.email) ?? [];

  const copyLink = (): void => {
    void navigator.clipboard.writeText(publicLink);
    toast.success("Link copiato");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sezione 1 — Aggiungi email manualmente */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">Aggiungi email manualmente</div>
            <div className="text-xs text-muted-foreground">Inserisci una o più email separate da virgola</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="luca.rossi@email.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button type="button" onClick={handleAddEmail} disabled={createMut.isPending || !emailInput.trim()}>
            Aggiungi
          </Button>
        </div>
      </Card>

      {/* Sezione 2 — CSV */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Upload className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">Carica lista (CSV / Excel)</div>
            <div className="text-xs text-muted-foreground">Una email per riga o separate da virgola</div>
          </div>
        </div>
        <label
          htmlFor="csvFile"
          className="flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-input bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <Upload className="h-5 w-5 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Clicca per selezionare un file CSV</span>
          <input
            id="csvFile"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleCsv(file);
            }}
          />
        </label>
      </Card>

      {/* Sezione 3 — Link condivisibile */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">Link evento condivisibile</div>
            <div className="text-xs text-muted-foreground">Chiunque con il link può iscriversi</div>
          </div>
        </div>
        {!linkInvitation ? (
          <Button onClick={handleGenerateLink} disabled={createMut.isPending} className="w-full sm:w-auto">
            <Link2 className="h-4 w-4" />
            Genera link di invito
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Input readOnly value={publicLink} className="flex-1 text-xs" />
            <Button type="button" variant="outline" onClick={copyLink}>
              <Copy className="h-4 w-4" />
              Copia
            </Button>
          </div>
        )}
      </Card>

      {/* Reminder manuali — solo a evento pubblicato */}
      {!hideReminder && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-sm">Invia reminder ora</div>
                <div className="text-xs text-muted-foreground">Manda subito un'email a chi non si è ancora iscritto</div>
              </div>
            </div>
            <Button onClick={() => sendReminders.mutate()} disabled={sendReminders.isPending} variant="outline">
              {sendReminders.isPending ? "Invio..." : "Invia reminder"}
            </Button>
          </div>
        </Card>
      )}

      {/* Lista invitati */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Label>Invitati via email ({emailInvites.length})</Label>
        </div>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {emailInvites.length === 0 && (
            <p className="text-sm text-muted-foreground">Nessun invitato ancora.</p>
          )}
          {emailInvites.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-1.5 text-sm">
              <div className="flex-1 min-w-0">
                <div className="truncate">{i.email}</div>
                {i.sentAt && <div className="text-[10px] text-emerald-700">Inviata {new Date(i.sentAt).toLocaleString("it-IT")}</div>}
              </div>
              <button
                type="button"
                onClick={() => resendMut.mutate(i.id)}
                disabled={resendMut.isPending}
                className="text-muted-foreground hover:text-primary p-1 disabled:opacity-50"
                aria-label="Reinvia"
                title="Reinvia email"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => deleteMut.mutate(i.id)}
                className="text-muted-foreground hover:text-destructive p-1"
                aria-label="Rimuovi"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
