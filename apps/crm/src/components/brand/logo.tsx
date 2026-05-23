import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps): JSX.Element {
  return (
    <img
      src="/logo.png"
      alt="Kicmatch"
      className={cn("h-12 w-auto object-contain", className)}
    />
  );
}
