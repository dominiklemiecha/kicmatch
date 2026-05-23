import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ParticipantListItem, ParticipantStatus } from "@kicmatch/shared";
import { AxiosError } from "axios";
import { Ban, CheckCircle2, Clock, CreditCard, Download, Mail, Phone, Search, User, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { listParticipants, updateParticipantStatus } from "@/features/events/participants-api";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type FilterStatus = ParticipantStatus | "ALL";

const STATUS_META: Record<ParticipantStatus, { label: string; bg: string; text: string }> = {
  INVITED: { label: "Invitato", bg: "bg-blue-100", text: "text-blue-700" },
  OPENED: { label: "Aperto", bg: "bg-sky-100", text: "text-sky-700" },
  STARTED: { label: "Iniziato", bg: "bg-amber-100", text: "text-amber-700" },
  CONFIRMED: { label: "Confermato", bg: "bg-green-100", text: "text-green-700" },
  PENDING_PAYMENT: { label: "In attesa pagamento", bg: "bg-orange-100", text: "text-orange-700" },
  PAID: { label: "Pagato", bg: "bg-emerald-100", text: "text-emerald-700" },
  CANCELLED: { label: "Annullato", bg: "bg-gray-100", text: "text-gray-700" },
  REJECTED: { label: "Rifiutato", bg: "bg-red-100", text: "text-red-700" },
};

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "ALL", label: "Tutti" },
  { value: "CONFIRMED", label: "Confermati" },
  { value: "PENDING_PAYMENT", label: "In attesa" },
  { value: "PAID", label: "Pagati" },
  { value: "CANCELLED", label: "Annullati" },
];

interface ParticipantsPanelProps {
  eventId: string;
}

export function ParticipantsPanel({ eventId }: ParticipantsPanelProps): JSX.Element {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["participants", eventId, filter, search],
    queryFn: () => listParticipants(eventId, { status: filter, q: search || undefined }),
    enabled: Boolean(eventId),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: string; status: ParticipantStatus }) => updateParticipantStatus(vars.id, { status: vars.status }),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ["participants", eventId] });
      const label = STATUS_META[vars.status].label;
      toast.success(`Stato aggiornato: ${label}`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Errore aggiornamento stato");
    },
  });

  const handleExport = async (): Promise<void> => {
    try {
      const res = await api.get(`/events/${eventId}/participants/export`, { responseType: "blob" });
      const url = window.URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `partecipanti-${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Errore export");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto items-center">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {f.label}
            </button>
          ))}
          <Button variant="outline" onClick={() => void handleExport()} className="shrink-0 ml-2">
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      {query.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!query.isLoading && (!query.data || query.data.length === 0) && (
        <Card className="p-10 text-center">
          <User className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <h2 className="font-semibold">Nessun partecipante</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {search || filter !== "ALL"
              ? "Nessun partecipante corrisponde ai filtri."
              : "Quando qualcuno si iscriverà al tuo evento lo vedrai qui."}
          </p>
        </Card>
      )}

      {query.data && query.data.length > 0 && (
        <Card className="overflow-hidden">
          <div className="divide-y">
            {query.data.map((p) => (
              <ParticipantRow
                key={p.id}
                p={p}
                onUpdate={(status) => updateMut.mutate({ id: p.id, status })}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

interface ParticipantRowProps {
  p: ParticipantListItem;
  onUpdate: (status: ParticipantStatus) => void;
}

function ParticipantRow({ p, onUpdate }: ParticipantRowProps): JSX.Element {
  const meta = STATUS_META[p.status];
  const initials = `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
      <div className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{p.firstName} {p.lastName}</span>
          <span className={cn("text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-full tracking-wide", meta.bg, meta.text)}>
            {meta.label}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3" />{p.email}</span>
          {p.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>}
          {p.ticketCode && <span className="font-mono text-[10px]">{p.ticketCode}</span>}
        </div>
      </div>
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-md border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent/5">
            Azioni
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {p.status !== "CONFIRMED" && (
              <DropdownMenuItem onSelect={() => onUpdate("CONFIRMED")}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Marca confermato
              </DropdownMenuItem>
            )}
            {p.status !== "PAID" && (
              <DropdownMenuItem onSelect={() => onUpdate("PAID")}>
                <CreditCard className="mr-2 h-4 w-4 text-emerald-600" />
                Marca pagato
              </DropdownMenuItem>
            )}
            {p.status !== "PENDING_PAYMENT" && (
              <DropdownMenuItem onSelect={() => onUpdate("PENDING_PAYMENT")}>
                <Clock className="mr-2 h-4 w-4 text-orange-600" />
                In attesa pagamento
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {p.status !== "CANCELLED" && (
              <DropdownMenuItem onSelect={() => onUpdate("CANCELLED")} className="text-destructive focus:text-destructive">
                <X className="mr-2 h-4 w-4" />
                Annulla iscrizione
              </DropdownMenuItem>
            )}
            {p.status !== "REJECTED" && (
              <DropdownMenuItem onSelect={() => onUpdate("REJECTED")} className="text-destructive focus:text-destructive">
                <Ban className="mr-2 h-4 w-4" />
                Rifiuta
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
