import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StepDef { path: string; label: string }
export const WIZARD_STEPS: StepDef[] = [
  { path: "inviti", label: "Inviti" },
  { path: "modulo", label: "Modulo" },
  { path: "biglietti", label: "Biglietti" },
  { path: "riepilogo", label: "Riepilogo" },
];

interface EventWizardShellProps {
  eventId: string;
  currentStep: number;
  totalSteps?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function EventWizardShell({ eventId: _eventId, currentStep, totalSteps = 5, title, subtitle, children }: EventWizardShellProps): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Esci dal wizard
        </Link>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {currentStep}/{totalSteps}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < currentStep ? "bg-primary" : "bg-muted")} />
        ))}
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-primary">Step {currentStep}</div>
        <h1 className="text-2xl font-bold tracking-tight mt-1">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
