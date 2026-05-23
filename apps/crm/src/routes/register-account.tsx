import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createRoute, useNavigate } from "@tanstack/react-router";
import { registerSchema, type RegisterInput } from "@kicmatch/shared";
import { AxiosError } from "axios";
import { CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerRequest } from "@/features/auth/auth-api";
import { useAuthStore } from "@/features/auth/auth-store";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { WizardLayout } from "@/features/onboarding/wizard-layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

function PwdCheck({ ok, label }: { ok: boolean; label: string }): JSX.Element {
  const Icon = ok ? CheckCircle2 : Circle;
  return (
    <div className={cn("flex items-center gap-2 text-xs", ok ? "text-green-600" : "text-muted-foreground")}>
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

function RegisterAccountPage(): JSX.Element {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useOnboardingStore((s) => s.setProfile);
  const [showPwd, setShowPwd] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
    mode: "onChange",
  });
  const pwd = form.watch("password");
  const checks = {
    len: pwd.length >= 8,
    upper: /[A-Z]/.test(pwd),
    num: /[0-9]/.test(pwd),
  };

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data, vars) => {
      setSession(data.accessToken, data.user);
      setProfile({ profileType: "PRIVATE", profileName: `${vars.firstName} ${vars.lastName}`, country: "Italia" });
      void navigate({ to: "/register/profile" });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message ?? "Registrazione fallita");
    },
  });

  return (
    <WizardLayout step={{ current: 2, total: 8 }} backTo="/register/plan" title="Crea il tuo account">
      <Form {...form}>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Luca" autoComplete="given-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cognome</FormLabel>
                <FormControl>
                  <Input placeholder="Rossi" autoComplete="family-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="luca.rossi@email.com" autoComplete="email" {...field} />
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
                  <div className="relative">
                    <Input type={showPwd ? "text" : "password"} autoComplete="new-password" {...field} />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                      aria-label={showPwd ? "Nascondi password" : "Mostra password"}
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="space-y-1.5">
            <PwdCheck ok={checks.len} label="Almeno 8 caratteri" />
            <PwdCheck ok={checks.upper} label="Una maiuscola" />
            <PwdCheck ok={checks.num} label="Un numero" />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? "Creazione..." : "Continua"}
          </Button>
        </form>
      </Form>
    </WizardLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register/account",
  component: RegisterAccountPage,
});
