import { createRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { WizardLayout } from "@/features/onboarding/wizard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Route as RootRoute } from "./__root";

function RegisterKicmatchPage(): JSX.Element {
  const navigate = useNavigate();
  const onboarding = useOnboardingStore();
  const [freq, setFreq] = useState(onboarding.kicmatchPayoutFrequency);
  const [iban, setIban] = useState(onboarding.kicmatchIban);
  const [holder, setHolder] = useState(onboarding.kicmatchIbanHolder);
  const [touched, setTouched] = useState(false);

  const cleanIban = iban.replace(/\s/g, "").toUpperCase();
  const holderError = holder.trim().length < 2 ? "Inserisci l'intestatario dell'IBAN" : null;
  const ibanError = !/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleanIban) ? "Inserisci un IBAN valido (formato internazionale)" : null;
  const isValid = !holderError && !ibanError;

  const handleContinue = (): void => {
    setTouched(true);
    if (!isValid) return;
    onboarding.setKicmatchPrefs({ frequency: freq, iban: cleanIban, ibanHolder: holder.trim() });
    void navigate({ to: "/register/review" });
  };

  return (
    <WizardLayout
      step={{ current: 5, total: 8 }}
      backTo="/register/payment"
      title="Incassa con Kicmatch per me"
      subtitle="Scegli le preferenze di incasso"
    >
      <div className="space-y-5">
        <div>
          <Label>Quando vuoi essere pagato?</Label>
          <select
            value={freq}
            onChange={(e) => setFreq(e.target.value as typeof freq)}
            className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="ON_DEMAND">Quando voglio</option>
            <option value="WEEKLY">Settimanalmente</option>
            <option value="MONTHLY">Mensilmente</option>
          </select>
          <p className="mt-1 text-xs text-muted-foreground">Decidi tu quando richiedere il trasferimento.</p>
        </div>

        <div>
          <Label>Dove vuoi ricevere i fondi?</Label>
          <div className="mt-1 flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm">
            <span>Bonifico bancario</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Riceverai i fondi sul conto bancario che indicherai.</p>
        </div>

        <div>
          <Label htmlFor="ibanHolder">Intestatario IBAN <span className="text-red-500">*</span></Label>
          <Input
            id="ibanHolder"
            className="mt-1"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            placeholder="Mario Rossi o Nome Azienda"
            required
          />
          {touched && holderError && <p className="mt-1 text-xs text-red-600">{holderError}</p>}
        </div>

        <div>
          <Label htmlFor="iban">IBAN <span className="text-red-500">*</span></Label>
          <Input
            id="iban"
            className="mt-1 font-mono"
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="IT60X0542811101000000123456"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">Senza spazi, formato internazionale.</p>
          {touched && ibanError && <p className="mt-1 text-xs text-red-600">{ibanError}</p>}
        </div>

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs space-y-1">
          <div className="font-semibold text-primary">Come funziona?</div>
          <p className="text-muted-foreground leading-relaxed">
            Incassiamo noi per te e trasferiamo i fondi sul tuo conto quando ci richiedi (al netto della commissione del
            piano).
          </p>
        </div>

        <Button onClick={handleContinue} className="w-full" size="lg" disabled={!isValid && touched}>
          Continua
        </Button>
      </div>
    </WizardLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register/kicmatch",
  component: RegisterKicmatchPage,
});
