import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface WizardStepsProps {
  eventId: string;
  currentStep: number;
}

interface Step {
  index: number;
  label: string;
  to: string;
}

function buildSteps(eventId: string): Step[] {
  return [
    { index: 1, label: "Dettagli", to: `/events/new?id=${eventId}` },
    { index: 2, label: "Inviti", to: `/events/${eventId}/inviti` },
    { index: 3, label: "Modulo", to: `/events/${eventId}/modulo` },
    { index: 4, label: "Biglietti", to: `/events/${eventId}/biglietti` },
    { index: 5, label: "Riepilogo", to: `/events/${eventId}/riepilogo` },
  ];
}

export function WizardSteps({ eventId, currentStep }: WizardStepsProps): JSX.Element {
  const steps = buildSteps(eventId);
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {steps.map((s) => {
        const isCurrent = s.index === currentStep;
        const isDone = s.index < currentStep;
        return (
          <Link
            key={s.index}
            to={s.to}
            className={cn(
              "group flex-1 min-w-0 focus:outline-none rounded-md",
            )}
            title={`Step ${s.index} — ${s.label}`}
          >
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors",
                isCurrent ? "bg-primary" : isDone ? "bg-primary/70" : "bg-muted group-hover:bg-muted-foreground/30",
              )}
            />
            <div
              className={cn(
                "mt-1 text-[10px] sm:text-xs text-center truncate transition-colors",
                isCurrent ? "text-primary font-semibold" : "text-muted-foreground group-hover:text-foreground",
              )}
            >
              {s.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
