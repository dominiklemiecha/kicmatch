import { createRoute } from "@tanstack/react-router";
import { LandingShell } from "@/features/landing/landing-shell";
import { Route as RootRoute } from "./__root";

function TerminiPage(): JSX.Element {
  return (
    <LandingShell>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Termini di servizio</h1>
        <p className="text-sm text-muted-foreground mt-2">Ultimo aggiornamento: 22 maggio 2025</p>

        <h2 className="text-xl font-bold mt-8">1. Accettazione</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Registrandoti o utilizzando il servizio Kicmatch accetti integralmente questi Termini. Se non sei d'accordo, non utilizzare il servizio.
        </p>

        <h2 className="text-xl font-bold mt-8">2. Descrizione del servizio e titolare</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Kicmatch è una piattaforma online di proprietà di <strong>Fire Feed S.r.l.</strong> (Start-up Innovativa — Società Benefit) per la creazione, gestione e promozione di eventi, con funzionalità di RSVP, raccolta moduli, pagamenti, check-in e analytics. I servizi sono offerti tramite il sito kicmatch.com.
        </p>
        <div className="mt-4 rounded-lg border bg-muted/40 p-4 text-sm">
          <div className="font-semibold text-foreground mb-2">Dati societari</div>
          <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 gap-y-1">
            <dt className="text-foreground font-medium">Ragione sociale</dt><dd className="text-muted-foreground">Fire Feed S.r.l. (Start-up Innovativa – Società Benefit)</dd>
            <dt className="text-foreground font-medium">P. IVA / C.F.</dt><dd className="text-muted-foreground">18446391007</dd>
            <dt className="text-foreground font-medium">Numero REA</dt><dd className="text-muted-foreground">RM-1786196</dd>
            <dt className="text-foreground font-medium">Capitale sociale</dt><dd className="text-muted-foreground">€ 100.000,00 (versato)</dd>
            <dt className="text-foreground font-medium">Sede legale</dt><dd className="text-muted-foreground">Via della Conciliazione, 44 — 00193 Roma (RM) — IT</dd>
            <dt className="text-foreground font-medium">CCIAA</dt><dd className="text-muted-foreground">Roma</dd>
            <dt className="text-foreground font-medium">PEC</dt><dd className="text-muted-foreground"><a href="mailto:firefeed@pec.it" className="text-primary hover:underline">firefeed@pec.it</a></dd>
            <dt className="text-foreground font-medium">Organo amministrativo</dt><dd className="text-muted-foreground">Cinà Giuseppina, Fenici Francesco Maria</dd>
          </dl>
        </div>

        <h2 className="text-xl font-bold mt-8">3. Account utente</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Per usare le funzionalità riservate è necessario creare un account. Sei responsabile della riservatezza delle credenziali e di tutte le attività che avvengono dal tuo account. Non puoi cedere l'account a terzi.
        </p>

        <h2 className="text-xl font-bold mt-8">4. Piani e pagamenti</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Sono disponibili più piani (FREE, PRO, BUSINESS, ENTERPRISE) con condizioni specifiche descritte nella pagina prezzi. Per il piano FREE, Fire Feed (per Kicmatch) trattiene una commissione del 5%-8% sulle transazioni a seconda del metodo di pagamento utilizzato dal partecipante. I pagamenti dei partecipanti vengono raccolti dalla piattaforma e riversati periodicamente all'organizzatore tramite bonifico, su richiesta.
        </p>

        <h2 className="text-xl font-bold mt-8">5. Contenuti utente</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Tu rimani proprietario dei contenuti caricati (immagini, descrizioni, dati partecipanti). Concedi a Kicmatch una licenza non esclusiva per ospitarli ed elaborarli al fine di fornire il servizio. Sei responsabile della liceità dei contenuti.
        </p>

        <h2 className="text-xl font-bold mt-8">6. Utilizzo consentito</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Non puoi utilizzare il servizio per attività illegali, fraudolente, che violino diritti di terzi, o per inviare spam. Ci riserviamo di sospendere o chiudere account che violino queste regole.
        </p>

        <h2 className="text-xl font-bold mt-8">7. Limitazione di responsabilità</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Fire Feed fornisce il servizio Kicmatch "così com'è" senza garanzie esplicite. Non saremo responsabili per danni indiretti, perdita di profitti o danni reputazionali derivanti dall'uso del servizio. La responsabilità totale è in ogni caso limitata all'importo pagato negli ultimi 12 mesi.
        </p>

        <h2 className="text-xl font-bold mt-8">8. Recesso e chiusura</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Puoi chiudere il tuo account in qualsiasi momento dalla sezione Impostazioni. I dati saranno conservati per il periodo richiesto dalla legge per poi essere cancellati.
        </p>

        <h2 className="text-xl font-bold mt-8">9. Foro competente e legge applicabile</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Questi Termini sono regolati dalla legge italiana. Per qualsiasi controversia il foro competente è quello del consumatore se applicabile, altrimenti quello di Roma.
        </p>

        <h2 className="text-xl font-bold mt-8">10. Contatti</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Per qualsiasi domanda sui Termini scrivi tramite PEC a <a href="mailto:firefeed@pec.it" className="text-primary hover:underline">firefeed@pec.it</a>.
        </p>
      </article>
    </LandingShell>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/termini",
  component: TerminiPage,
});
