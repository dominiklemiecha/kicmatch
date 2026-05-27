import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, createRoute, useNavigate } from "@tanstack/react-router";
import { loginSchema, type LoginInput } from "@kicmatch/shared";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/auth-layout";
import { loginRequest } from "@/features/auth/auth-api";
import { useAuthStore } from "@/features/auth/auth-store";
import { registerPushNotifications } from "@/lib/push";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Route as RootRoute } from "./__root";

function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);

  // If a session is already restored, skip the login form and route to the
  // correct landing area. Useful for the native app shell that always lands
  // here on launch.
  useEffect(() => {
    if (status === "authenticated" && user) {
      void registerPushNotifications();
      void navigate({
        to: user.role === "SUPERADMIN" ? "/admin" : "/dashboard",
        replace: true,
      });
    }
  }, [status, user, navigate]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      toast.success("Bentornato!");
      void registerPushNotifications();
      void navigate({ to: data.user.role === "SUPERADMIN" ? "/admin" : "/dashboard" });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Credenziali non valide");
    },
  });

  return (
    <AuthLayout
      title="Accedi a Kicmatch"
      subtitle="Inserisci le tue credenziali per continuare"
      footer={
        <>
          Non hai un account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Registrati gratis
          </Link>
        </>
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
                  <Input type="email" autoComplete="email" placeholder="luca.rossi@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
              Password dimenticata?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Accesso..." : "Accedi"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/login",
  component: LoginPage,
});
