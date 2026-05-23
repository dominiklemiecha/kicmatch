import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createRoute, useParams, useSearch } from "@tanstack/react-router";
import type { FieldDef, PublicEvent, RsvpInput } from "@kicmatch/shared";
import { rsvpInputSchema } from "@kicmatch/shared";
import { AxiosError } from "axios";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Globe,
  Lock,
  MapPin,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createCheckoutSession, getPublicEvent, rsvpToEvent } from "@/features/public/public-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

type Step = "INVITE" | "BASE" | "FORM" | "CONFIRM" | "PAYMENT" | "DONE";

const baseSchema = z.object({
  firstName: z.string().min(1, "Nome richiesto"),
  lastName: z.string().min(1, "Cognome richiesto"),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
});
type BaseValues = z.infer<typeof baseSchema>;

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(cents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" });
}

function StepBars({ current, total }: { current: number; total: number }): JSX.Element {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn("h-1.5 flex-1 rounded-full", i < current ? "bg-primary" : "bg-muted")}
        />
      ))}
    </div>
  );
}

function PageShell({
  children,
  title,
  step,
  totalSteps,
  onBack,
  indicator,
}: {
  children: React.ReactNode;
  title?: string;
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  indicator?: string;
}): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="mx-auto w-full max-w-md px-4 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Indietro
            </button>
          ) : (
            <span />
          )}
          {indicator && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full tabular-nums">
              {indicator}
            </span>
          )}
        </div>
        {step !== undefined && totalSteps !== undefined && (
          <StepBars current={step} total={totalSteps} />
        )}
        {title && <h1 className="text-2xl font-bold tracking-tight mt-4">{title}</h1>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function CustomFieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}): JSX.Element {
  switch (field.type) {
    case "COMPANY":
    case "SHORT_TEXT":
      return (
        <div>
          <Label>
            {field.label}
            {field.required && " *"}
          </Label>
          <Input
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1"
            placeholder={field.placeholder ?? undefined}
          />
        </div>
      );
    case "LONG_TEXT":
      return (
        <div>
          <Label>
            {field.label}
            {field.required && " *"}
          </Label>
          <textarea
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder={field.placeholder ?? undefined}
            className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
          />
        </div>
      );
    case "SELECT":
      return (
        <div>
          <Label>
            {field.label}
            {field.required && " *"}
          </Label>
          <select
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Seleziona...</option>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    case "MULTISELECT": {
      const current = (value as string[]) ?? [];
      const toggle = (opt: string): void => {
        if (current.includes(opt)) onChange(current.filter((o) => o !== opt));
        else onChange([...current, opt]);
      };
      return (
        <div>
          <Label>
            {field.label}
            {field.required && " *"}
          </Label>
          <div className="mt-1 space-y-1.5">
            {(field.options ?? []).map((o) => (
              <label
                key={o}
                className="flex items-center gap-2 text-sm rounded-md border bg-muted/20 px-3 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={current.includes(o)}
                  onChange={() => toggle(o)}
                  className="rounded border-input"
                />
                {o}
              </label>
            ))}
          </div>
        </div>
      );
    }
    default:
      return <div />;
  }
}

function PaymentStep({
  eventSlug,
  event: e,
  baseData,
  formData,
  privacyAccepted,
  invitationToken,
}: {
  eventSlug: string;
  event: PublicEvent;
  baseData: BaseValues | null;
  formData: Record<string, unknown>;
  privacyAccepted: boolean;
  invitationToken: string | undefined;
}): JSX.Element {
  const checkoutMut = useMutation({
    mutationFn: () => {
      if (!baseData) throw new Error("Dati mancanti");
      return createCheckoutSession(eventSlug, {
        email: baseData.email,
        firstName: baseData.firstName,
        lastName: baseData.lastName,
        phone: baseData.phone,
        formData,
        privacyAccepted,
        invitationToken,
      });
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Errore durante il pagamento");
    },
  });

  return (
    <PageShell title="Pagamento" step={4} totalSteps={4} indicator="4/4">
      <Card className="p-6 space-y-5">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">Totale da pagare</div>
          <div className="text-3xl font-bold tracking-tight">
            {e.priceCents !== null ? formatPrice(e.priceCents, e.currency) : "—"}
          </div>
          <div className="text-xs text-muted-foreground">per {e.name}</div>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Pagamento sicuro con Stripe</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Verrai reindirizzato alla pagina di pagamento sicura. I tuoi dati sono protetti.
          </p>
        </div>
        <Button onClick={() => checkoutMut.mutate()} disabled={checkoutMut.isPending} size="lg" className="w-full">
          {checkoutMut.isPending ? "Reindirizzamento..." : "Paga con carta"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          La tua iscrizione sarà confermata dopo il pagamento.
        </p>
      </Card>
    </PageShell>
  );
}

function PublicEventPage(): JSX.Element {
  const { slug } = useParams({ strict: false }) as { slug: string };
  const search = useSearch({ strict: false }) as { t?: string };
  const invitationToken = search?.t;

  const eventQuery = useQuery({
    queryKey: ["public-event", slug],
    queryFn: () => getPublicEvent(slug),
  });

  const [step, setStep] = useState<Step>("INVITE");
  const [baseData, setBaseData] = useState<BaseValues | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [resultCode, setResultCode] = useState<string | null>(null);

  const baseForm = useForm<BaseValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  const rsvpMut = useMutation({
    mutationFn: (input: RsvpInput) => rsvpToEvent(slug, input),
    onSuccess: (data) => {
      if (data.requiresPayment) {
        setStep("PAYMENT");
      } else {
        setResultCode(data.participant.ticketCode);
        setStep("DONE");
      }
    },
    onError: (
      error: AxiosError<{ message?: string; details?: Array<{ message: string }> }>,
    ) => {
      const msg =
        error.response?.data?.details?.[0]?.message ??
        error.response?.data?.message ??
        "Errore iscrizione";
      toast.error(msg);
    },
  });

  if (eventQuery.isLoading) {
    return (
      <PageShell>
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      </PageShell>
    );
  }
  if (eventQuery.isError || !eventQuery.data) {
    return (
      <PageShell title="Evento non trovato">
        <Card className="p-6 text-sm text-muted-foreground">
          L'evento richiesto non esiste o non è più disponibile.
        </Card>
      </PageShell>
    );
  }

  const e = eventQuery.data;

  // Step 1: Invite card
  if (step === "INVITE") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="mx-auto w-full max-w-md">
          {/* Hero image */}
          <div className="relative">
            {e.coverImageUrl ? (
              <img src={e.coverImageUrl} alt={e.name} className="w-full h-56 sm:h-64 object-cover" />
            ) : (
              <div className="w-full h-56 sm:h-64 bg-gradient-to-br from-primary/40 to-pink-400" />
            )}
            <button
              type="button"
              onClick={() => window.history.back()}
              className="absolute top-4 left-4 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow"
              aria-label="Indietro"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Card sliding up over hero */}
          <div className="-mt-6 relative px-4 pb-8">
            <div className="rounded-2xl bg-card shadow-xl border p-6 space-y-5">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{e.name}</h1>
                <div className="mt-3 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{formatDate(e.startAt)}</div>
                    <div className="text-xs text-muted-foreground">
                      {e.locationType === "ONLINE" ? "Online" : (e.locationName ?? "—")}
                    </div>
                  </div>
                </div>
              </div>

              {e.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>
              )}

              <div className="space-y-2.5 text-sm border-t pt-4">
                {e.availableSpots !== null && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <span>{e.availableSpots} posti disponibili</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    {e.isPaid ? <Lock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <span>
                    {e.isPaid && e.priceCents
                      ? <>Evento a pagamento — <strong>{formatPrice(e.priceCents, e.currency)}</strong></>
                      : "Evento gratuito"}
                  </span>
                </div>
                {e.rsvpDeadline && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span>Scadenza conferma: {new Date(e.rsvpDeadline).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground border-t pt-3">
                Organizzato da <span className="font-medium text-foreground">{e.organizerName}</span>
              </div>

              <Button size="lg" className="w-full rounded-xl" onClick={() => setStep("BASE")}>
                Conferma partecipazione
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: I tuoi dati (base info)
  if (step === "BASE") {
    const onSubmit = (values: BaseValues): void => {
      setBaseData(values);
      const customFields = e.form.fields.filter(
        (f) => f.type !== "FIRST_LAST_NAME" && f.type !== "EMAIL" && f.type !== "PHONE",
      );
      if (customFields.length > 0) {
        setStep("FORM");
      } else {
        setStep("CONFIRM");
      }
    };
    return (
      <PageShell
        title="I tuoi dati"
        step={1}
        totalSteps={4}
        indicator="1/4"
        onBack={() => setStep("INVITE")}
      >
        <Card className="p-6">
          <form onSubmit={baseForm.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="firstName">Nome *</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                {...baseForm.register("firstName")}
                className="mt-1"
              />
              {baseForm.formState.errors.firstName && (
                <p className="text-xs text-destructive mt-1">
                  {baseForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Cognome *</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                {...baseForm.register("lastName")}
                className="mt-1"
              />
              {baseForm.formState.errors.lastName && (
                <p className="text-xs text-destructive mt-1">
                  {baseForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...baseForm.register("email")}
                className="mt-1"
              />
              {baseForm.formState.errors.email && (
                <p className="text-xs text-destructive mt-1">
                  {baseForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                {...baseForm.register("phone")}
                className="mt-1"
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Continua
            </Button>
          </form>
        </Card>
      </PageShell>
    );
  }

  // Step 3: Custom form fields
  if (step === "FORM") {
    const customFields = e.form.fields.filter(
      (f) => f.type !== "FIRST_LAST_NAME" && f.type !== "EMAIL" && f.type !== "PHONE",
    );
    const onContinue = (): void => {
      for (const f of customFields) {
        if (f.required && !formData[f.id]) {
          toast.error(`${f.label} è obbligatorio`);
          return;
        }
      }
      setStep("CONFIRM");
    };
    return (
      <PageShell
        title="Modulo di registrazione"
        step={2}
        totalSteps={4}
        indicator="2/4"
        onBack={() => setStep("BASE")}
      >
        <Card className="p-6 space-y-4">
          {customFields.map((f) => (
            <CustomFieldInput
              key={f.id}
              field={f}
              value={formData[f.id]}
              onChange={(v) => setFormData((prev) => ({ ...prev, [f.id]: v }))}
            />
          ))}
          <Button onClick={onContinue} size="lg" className="w-full">
            Continua
          </Button>
        </Card>
      </PageShell>
    );
  }

  // Step 4: Confirm & submit
  if (step === "CONFIRM") {
    const hasCustomFields = e.form.fields.filter(
      (f) => f.type !== "FIRST_LAST_NAME" && f.type !== "EMAIL" && f.type !== "PHONE",
    ).length > 0;

    const submit = (): void => {
      if (!baseData) return;
      if (e.form.privacyRequired && !privacyAccepted) {
        toast.error("Devi accettare la privacy per continuare");
        return;
      }
      if (e.isPaid) {
        setStep("PAYMENT");
        return;
      }
      rsvpMut.mutate({
        email: baseData.email,
        firstName: baseData.firstName,
        lastName: baseData.lastName,
        phone: baseData.phone,
        formData,
        privacyAccepted,
        invitationToken,
      });
    };
    return (
      <PageShell
        title="Conferma i tuoi dati"
        step={3}
        totalSteps={4}
        indicator="3/4"
        onBack={() => setStep(hasCustomFields ? "FORM" : "BASE")}
      >
        <Card className="p-6 space-y-4">
          {baseData && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-1.5 text-sm">
              <SummaryRow
                label="Nome"
                value={`${baseData.firstName} ${baseData.lastName}`}
              />
              <SummaryRow label="Email" value={baseData.email} />
              {baseData.phone && <SummaryRow label="Telefono" value={baseData.phone} />}
            </div>
          )}
          {Object.keys(formData).length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-1.5 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Dettagli aggiuntivi
              </div>
              {e.form.fields
                .filter(
                  (f) =>
                    f.type !== "FIRST_LAST_NAME" &&
                    f.type !== "EMAIL" &&
                    f.type !== "PHONE",
                )
                .map((f) => {
                  const v = formData[f.id];
                  if (v === undefined || v === null || v === "") return null;
                  const display = Array.isArray(v) ? v.join(", ") : String(v);
                  return <SummaryRow key={f.id} label={f.label} value={display} />;
                })}
            </div>
          )}
          {e.form.privacyRequired && (
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(ev) => setPrivacyAccepted(ev.target.checked)}
                className="mt-0.5 rounded border-input"
              />
              <span>Accetto la privacy policy e i termini di servizio.</span>
            </label>
          )}
          <Button
            onClick={submit}
            size="lg"
            className="w-full"
            disabled={rsvpMut.isPending}
          >
            {rsvpMut.isPending
              ? "Conferma in corso..."
              : e.isPaid
                ? "Procedi al pagamento"
                : "Conferma iscrizione"}
          </Button>
        </Card>
      </PageShell>
    );
  }

  // Step 5: Payment
  if (step === "PAYMENT") {
    return (
      <PaymentStep
        eventSlug={slug}
        event={e}
        baseData={baseData}
        formData={formData}
        privacyAccepted={privacyAccepted}
        invitationToken={invitationToken}
      />
    );
  }

  // Step 6: Done / Confirmed
  return (
    <PageShell>
      <Card className="p-8 text-center space-y-5">
        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {e.isPaid ? "Iscrizione registrata" : "Iscrizione confermata!"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {e.isPaid
              ? "La tua iscrizione è in attesa di pagamento. Riceverai un'email con i prossimi passi."
              : `Sei iscritto a ${e.name}.`}
          </p>
        </div>
        {resultCode && (
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Codice partecipante
            </div>
            <div className="font-mono text-sm font-semibold">{resultCode}</div>
          </div>
        )}
        <div className="rounded-lg border bg-card p-4 text-sm space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(e.startAt)}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {e.locationType === "ONLINE" ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            {e.locationType === "ONLINE" ? "Evento online" : e.locationName ?? "—"}
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground border-t pt-4">
          <Lock className="h-3 w-3" /> I tuoi dati sono protetti
        </div>
      </Card>
    </PageShell>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/e/$slug",
  component: PublicEventPage,
});
