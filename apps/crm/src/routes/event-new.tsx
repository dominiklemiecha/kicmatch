import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import { createEventSchema, type CreateEventInput } from "@kicmatch/shared";
import { AxiosError } from "axios";
import { ChevronLeft, ImagePlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createEvent } from "@/features/events/events-api";
import { api } from "@/lib/api-client";
import { useEventWizardStore } from "@/features/events/event-wizard-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

// Local form schema — split date+time into separate fields, validates location
const formSchema = z
  .object({
    name: z.string().min(1, "Nome obbligatorio").max(120),
    description: z.string().max(5000).optional(),
    date: z.string().min(1, "Data obbligatoria"),
    time: z.string().min(1, "Ora obbligatoria"),
    locationType: z.enum(["PHYSICAL", "ONLINE"]),
    locationName: z.string().optional(),
    onlineUrl: z.string().url("URL non valido").optional().or(z.literal("")),
    coverImageUrl: z.string().optional(),
  })
  .refine(
    (data) => (data.locationType === "PHYSICAL" ? !!data.locationName : !!data.onlineUrl),
    { message: "Inserisci luogo o URL online", path: ["locationName"] },
  );

type FormValues = z.infer<typeof formSchema>;

function StepHeader({ current, total }: { current: number; total: number }): JSX.Element {
  return (
    <div className="flex items-center gap-2 text-xs">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full",
            i < current ? "bg-primary" : i === current - 1 ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

function EventNewPage(): JSX.Element {
  const navigate = useNavigate();
  const setEventId = useEventWizardStore((s) => s.setEventId);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      date: "",
      time: "09:00",
      locationType: "PHYSICAL",
      locationName: "",
      onlineUrl: "",
      coverImageUrl: "",
    },
  });

  const locationType = form.watch("locationType");

  const mutation = useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: (data) => {
      setEventId(data.id);
      toast.success("Evento creato. Proseguiamo con gli inviti.");
      void navigate({ to: "/events/$id/inviti", params: { id: data.id } });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Errore creazione evento");
    },
  });

  const onSubmit = (values: FormValues): void => {
    const startAt = new Date(`${values.date}T${values.time}:00`);
    const payload: CreateEventInput = {
      name: values.name,
      description: values.description || null,
      startAt: startAt.toISOString(),
      locationType: values.locationType,
      locationName: values.locationType === "PHYSICAL" ? values.locationName || null : null,
      onlineUrl: values.locationType === "ONLINE" ? values.onlineUrl || null : null,
      coverImageUrl: values.coverImageUrl || null,
    };
    const valid = createEventSchema.safeParse(payload);
    if (!valid.success) {
      toast.error("Dati non validi");
      return;
    }
    mutation.mutate(valid.data);
  };

  const handleCoverFile = async (file: File): Promise<void> => {
    try {
      const presign = await api.post<{ uploadUrl: string; publicUrl: string }>("/storage/presign", { contentType: file.type });
      await fetch(presign.data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setCoverPreview(presign.data.publicUrl);
      form.setValue("coverImageUrl", presign.data.publicUrl);
    } catch {
      toast.error("Errore upload immagine");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Indietro
        </Link>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">1/5</span>
      </div>

      <StepHeader current={1} total={5} />

      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">Step 1</div>
        <h1 className="text-2xl font-bold tracking-tight mt-1">Dettagli evento</h1>
        <p className="text-muted-foreground text-sm mt-1">Imposta le informazioni principali</p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome evento *</FormLabel>
                  <FormControl>
                    <Input placeholder="KIC Motorsports Day" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Una giornata esclusiva in pista tra motori, adrenalina e grandi passioni."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ora *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo di evento</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => form.setValue("locationType", "PHYSICAL")}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    locationType === "PHYSICAL" ? "border-primary bg-primary/5 text-primary" : "border-input hover:bg-accent/5",
                  )}
                >
                  In presenza
                </button>
                <button
                  type="button"
                  onClick={() => form.setValue("locationType", "ONLINE")}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    locationType === "ONLINE" ? "border-primary bg-primary/5 text-primary" : "border-input hover:bg-accent/5",
                  )}
                >
                  Online
                </button>
              </div>
            </div>

            {locationType === "PHYSICAL" ? (
              <FormField
                control={form.control}
                name="locationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Luogo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Monza Circuit, Monza (MB), Italia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="onlineUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL evento *</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://meet.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-2">
              <Label>Immagine di copertina</Label>
              <label
                htmlFor="coverFile"
                className="relative flex items-center justify-center h-40 rounded-lg border-2 border-dashed border-input bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="cover" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground text-sm">
                    <ImagePlus className="h-6 w-6 mb-2" />
                    Clicca o trascina un&apos;immagine
                  </div>
                )}
                <input
                  id="coverFile"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleCoverFile(file);
                  }}
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvataggio..." : "Continua"}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/events/new",
  component: EventNewPage,
});
