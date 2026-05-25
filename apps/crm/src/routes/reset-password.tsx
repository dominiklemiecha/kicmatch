import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, createRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/features/auth/auth-layout";
import { resetPasswordRequest } from "@/features/auth/auth-api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Route as RootRoute } from "./__root";

const schema = z
  .object({
    password: z.string().min(8, "Almeno 8 caratteri").max(120),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Le password non coincidono",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordPage(): JSX.Element {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search?.token ?? "";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => resetPasswordRequest(token, values.password),
    onSuccess: () => {
      toast.success("Password aggiornata! Accedi con la nuova password.");
      void navigate({ to: "/login" });
    },
    onError: (err) => {
      const msg =
        err instanceof AxiosError
          ? (err.response?.data as { message?: string })?.message ?? "Link non valido o scaduto"
          : "Errore durante l'aggiornamento";
      toast.error(msg);
    },
  });

  if (!token) {
    return (
      <AuthLayout
        title="Link non valido"
        subtitle="Il link di reset non contiene un token. Richiedine uno nuovo."
        footer={
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Richiedi nuovo link
          </Link>
        }
      >
        <div />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nuova password"
      subtitle="Scegli una password sicura, almeno 8 caratteri."
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          ← Torna al login
        </Link>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nuova password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conferma password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Aggiornamento…" : "Imposta nuova password"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/reset-password",
  component: ResetPasswordPage,
});
