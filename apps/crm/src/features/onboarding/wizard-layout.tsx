import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WizardLayoutProps {
  step?: { current: number; total: number };
  backTo?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function WizardLayout({ step, backTo, title, subtitle, children, footer, className }: WizardLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="mx-auto w-full max-w-md px-4 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-4">
          {backTo ? (
            <Link to={backTo} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" /> Indietro
            </Link>
          ) : <span />}
          {step && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full tabular-nums">
              {step.current}/{step.total}
            </span>
          )}
        </div>
        <div className={cn("rounded-2xl border bg-card shadow-sm p-6 sm:p-8", className)}>
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="text-center text-sm text-muted-foreground mt-6">{footer}</div>}
      </div>
    </div>
  );
}
