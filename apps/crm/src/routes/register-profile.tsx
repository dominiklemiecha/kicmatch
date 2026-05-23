import { createRoute, useNavigate } from "@tanstack/react-router";
import { Building2, User } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/auth-store";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { WizardLayout } from "@/features/onboarding/wizard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

const COUNTRIES = ["Italia", "Svizzera", "Francia", "Germania", "Spagna", "Regno Unito"];

function RegisterProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const onboarding = useOnboardingStore();
  const [profileType, setProfileType] = useState<"PRIVATE" | "BUSINESS">(onboarding.profileType);
  const [profileName, setProfileName] = useState(
    onboarding.profileName || (user ? `${user.firstName} ${user.lastName}` : ""),
  );
  const [country, setCountry] = useState(onboarding.country);
  const [touched, setTouched] = useState(false);

  const profileNameError = profileName.trim().length < 2 ? "Inserisci un nome profilo (min. 2 caratteri)" : null;
  const countryError = !country ? "Seleziona un paese" : null;
  const isValid = !profileNameError && !countryError;

  const handleContinue = (): void => {
    setTouched(true);
    if (!isValid) return;
    onboarding.setProfile({ profileType, profileName: profileName.trim(), country });
    void navigate({ to: "/register/payment" });
  };

  return (
    <WizardLayout step={{ current: 3, total: 8 }} backTo="/register/account" title="Informazioni sul tuo profilo">
      <div className="space-y-5">
        <div>
          <Label>Tipologia di account</Label>
          <div className="mt-2 space-y-2">
            <ProfileTypeCard
              icon={User}
              title="Privato"
              subtitle="Per eventi personali"
              selected={profileType === "PRIVATE"}
              onClick={() => setProfileType("PRIVATE")}
            />
            <ProfileTypeCard
              icon={Building2}
              title="Azienda / Organizzazione"
              subtitle="Per eventi aziendali"
              selected={profileType === "BUSINESS"}
              onClick={() => setProfileType("BUSINESS")}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="profileName">Nome profilo <span className="text-red-500">*</span></Label>
          <Input
            id="profileName"
            className="mt-2"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Es. Luca Rossi o Acme Srl"
            required
          />
          {touched && profileNameError && <p className="mt-1 text-xs text-red-600">{profileNameError}</p>}
        </div>

        <div>
          <Label htmlFor="country">Paese <span className="text-red-500">*</span></Label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="">Seleziona un paese…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {touched && countryError && <p className="mt-1 text-xs text-red-600">{countryError}</p>}
        </div>

        <p className="text-xs text-muted-foreground">
          Queste informazioni potrai modificarle in qualsiasi momento.
        </p>

        <Button onClick={handleContinue} className="w-full" size="lg" disabled={!isValid && touched}>
          Continua
        </Button>
      </div>
    </WizardLayout>
  );
}

interface ProfileTypeCardProps {
  icon: typeof User;
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
}

function ProfileTypeCard({ icon: Icon, title, subtitle, selected, onClick }: ProfileTypeCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 rounded-lg border text-left transition-colors",
        selected ? "border-primary bg-primary/5" : "border-input hover:bg-accent/5",
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <div
        className={cn(
          "h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center",
          selected ? "border-primary bg-primary" : "border-muted-foreground/30",
        )}
      >
        {selected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
      </div>
    </button>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register/profile",
  component: RegisterProfilePage,
});
