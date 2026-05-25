import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, createRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/features/auth/auth-layout";
import { forgotPasswordRequest } from "@/features/auth/auth-api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Route as RootRoute } from "./__root";

const schema = z.object({ email: z.string().email("Email non valida") });
type FormValues = z.infer<typeof schema>;

function ForgotPasswordPage(): JSX.Element {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => forgotPasswordRequest(values.email),
    onSuccess: () => {
      toast.success("Se l'email esiste, riceverai un link a breve");
      form.reset();
    },
    onError: () => {
      // Privacy: never reveal whether the email exists
      toast.success("Se l'email esiste, riceverai un link a breve");
    },
  });

  return (
    <AuthLayout
      title="Recupero password"
      subtitle="Inserisci l'email del tuo account: ti invieremo un link per reimpostare la password."
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@esempio.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Invio in corso…" : "Invia link di recupero"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});
