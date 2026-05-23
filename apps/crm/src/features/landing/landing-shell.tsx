import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";

const NAV_ITEMS = [
  { to: "/funzionalita", label: "Funzionalità" },
  { to: "/pricing", label: "Prezzi" },
];

interface LandingShellProps {
  children: ReactNode;
  /** Apply dark hero background on the header (default: only on home) */
  transparentHeader?: boolean;
}

export function LandingShell({ children, transparentHeader = false }: LandingShellProps): JSX.Element {
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      void navigate({ to: role === "SUPERADMIN" ? "/admin" : "/dashboard", replace: true });
    }
  }, [status, role, navigate]);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Sticky scroll detection — switches transparent header to solid on scroll
  useEffect(() => {
    const handler = (): void => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const headerClass = transparentHeader
    ? `fixed top-0 inset-x-0 z-40 transition-colors duration-200 ${scrolled ? "bg-[#0b0518]/80 backdrop-blur border-b border-white/10" : "bg-transparent"}`
    : "sticky top-0 z-40 bg-white/85 backdrop-blur border-b";

  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      {/* HEADER */}
      <header className={headerClass}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={transparentHeader ? "/logo_white.png" : "/logo.png"}
              alt="Kicmatch"
              className="h-7 sm:h-9 w-auto"
            />
          </Link>

          {/* Desktop right cluster: nav + accedi + CTA */}
          <div className="hidden md:flex items-center gap-7">
            <nav className={`flex items-center gap-7 text-sm ${transparentHeader ? "text-white/80" : "text-muted-foreground"}`}>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={transparentHeader ? "hover:text-white transition-colors" : "hover:text-foreground transition-colors"}
                  activeProps={{ className: transparentHeader ? "text-white font-semibold" : "text-foreground font-semibold" }}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/login"
                className={transparentHeader ? "hover:text-white transition-colors" : "hover:text-foreground transition-colors"}
              >
                Accedi
              </Link>
            </nav>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-5">
                Crea un evento
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-md ${transparentHeader ? "text-white" : "text-foreground"}`}
            onClick={() => setMobileOpen(true)}
            aria-label="Apri menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden text-white"
          style={{
            backgroundImage: "url(/hero-bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "#000",
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Content */}
          <div className="relative h-full flex flex-col">
            <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
                <img src="/logo_white.png" alt="Kicmatch" className="h-7 w-auto" />
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-white" aria-label="Chiudi">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center items-center gap-6 px-6">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-3xl font-bold tracking-tight text-white/90 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-3xl font-bold tracking-tight text-white/90 hover:text-white"
              >
                Accedi
              </Link>
            </nav>

            <div className="p-6 border-t border-white/10 space-y-3">
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg" size="lg">
                  Crea un evento
                </Button>
              </Link>
              <p className="text-center text-xs text-white/50">
                Inizia gratis · Nessuna carta richiesta
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="relative bg-white text-muted-foreground border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Link to="/" className="inline-flex items-center">
                <img src="/logo.png" alt="Kicmatch" className="h-8 w-auto" />
              </Link>
              <p className="mt-3 text-sm leading-relaxed">
                Kicmatch è una piattaforma di gestione eventi fornita da{" "}
                <strong className="text-foreground">Fire Feed S.r.l.</strong> — Start-up Innovativa, Società Benefit.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground/80">
                <strong className="text-foreground">Fire Feed S.r.l.</strong> · P.IVA / C.F. 18446391007 · REA RM-1786196 · Capitale sociale: €100.000,00 (versato) · Sede legale: Via della Conciliazione 44, 00193 Roma (RM) · CCIAA di Roma · PEC:{" "}
                <a href="mailto:firefeed@pec.it" className="text-foreground hover:underline">firefeed@pec.it</a>
                {" "}· Organo amministrativo: Cinà Giuseppina, Fenici Francesco Maria
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Prodotto</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><Link to="/funzionalita" className="hover:text-foreground">Funzionalità</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Prezzi</Link></li>
                <li><Link to="/login" className="hover:text-foreground">Accedi</Link></li>
                <li><Link to="/register" className="hover:text-foreground">Crea un evento</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Azienda</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><a href="mailto:firefeed@pec.it" className="hover:text-foreground">Supporto</a></li>
                <li><a href="mailto:firefeed@pec.it" className="hover:text-foreground">Contatti</a></li>
                <li><Link to="/privacy" className="hover:text-foreground">Gestione dati</Link></li>
                <li><Link to="/funzionalita" className="hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Legale</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><Link to="/privacy" className="hover:text-foreground">Privacy policy</Link></li>
                <li><Link to="/termini" className="hover:text-foreground">Termini di servizio</Link></li>
                <li><Link to="/cookie" className="hover:text-foreground">Cookie policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t text-xs text-muted-foreground text-center">
            © 2026 <span className="text-foreground">Fire Feed S.r.l.</span> — Tutti i diritti riservati.
          </div>
        </div>
      </footer>
    </div>
  );
}
