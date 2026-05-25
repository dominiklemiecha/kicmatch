import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface PublicShellProps {
  children: ReactNode;
  containerClassName?: string;
}

/**
 * Layout for public-facing pages (invites, RSVP, post-payment screens).
 * Shows the Kicmatch logo at the top and the legal footer at the bottom on
 * every step so the recipient can verify the page belongs to a real company.
 */
export function PublicShell({ children, containerClassName }: PublicShellProps): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <header className="bg-white/90 backdrop-blur border-b border-purple-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-center">
          <Link to="/" aria-label="Kicmatch">
            <img src="/logo.png" alt="Kicmatch" className="h-7 w-auto" />
          </Link>
        </div>
      </header>

      <main className={containerClassName ?? "flex-1"}>{children}</main>

      <footer className="bg-white border-t border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 text-center">
          <img src="/logo.png" alt="Kicmatch" className="h-6 w-auto mx-auto opacity-80" />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Kicmatch è una piattaforma di gestione eventi fornita da{" "}
            <strong className="text-foreground">Fire Feed S.r.l.</strong> — Start-up Innovativa, Società Benefit.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/80">
            P.IVA / C.F. 18446391007 · Sede legale: Via della Conciliazione 44, 00193 Roma (RM) · PEC{" "}
            <a href="mailto:firefeed@pec.it" className="text-foreground hover:underline">firefeed@pec.it</a>
          </p>
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
            <li><Link to="/termini" className="text-muted-foreground hover:text-foreground">Termini</Link></li>
            <li><Link to="/cookie" className="text-muted-foreground hover:text-foreground">Cookie</Link></li>
            <li><a href="mailto:info@kicmatch.com" className="text-muted-foreground hover:text-foreground">Supporto</a></li>
          </ul>
          <p className="mt-3 text-[11px] text-muted-foreground/70">
            © 2026 Fire Feed S.r.l. — Tutti i diritti riservati.
          </p>
        </div>
      </footer>
    </div>
  );
}
