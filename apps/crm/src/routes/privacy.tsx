import { createRoute } from "@tanstack/react-router";
import { LandingShell } from "@/features/landing/landing-shell";
import { Route as RootRoute } from "./__root";

function PrivacyPage(): JSX.Element {
  return (
    <LandingShell>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16 prose prose-sm sm:prose">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Informativa sulla Privacy</h1>
        <p className="text-sm text-muted-foreground mt-2">Ultimo aggiornamento: 22 maggio 2025</p>

        <h2 className="text-xl font-bold mt-8">1. Titolare del trattamento</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Il titolare del trattamento dei dati personali è <strong>Fire Feed S.r.l.</strong> — Start-up Innovativa, Società Benefit — azienda proprietaria della piattaforma Kicmatch.
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
        <p className="text-sm leading-relaxed mt-3 text-muted-foreground">
          Per qualsiasi richiesta relativa al trattamento dei tuoi dati puoi scriverci tramite PEC a <a href="mailto:firefeed@pec.it" className="text-primary hover:underline">firefeed@pec.it</a>.
        </p>

        <h2 className="text-xl font-bold mt-8">2. Dati raccolti</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Raccogliamo i dati che ci fornisci direttamente al momento della registrazione (nome, cognome, email, telefono) e quelli che generi utilizzando la piattaforma (eventi creati, partecipanti, transazioni). Possiamo inoltre raccogliere dati tecnici (indirizzo IP, browser, log di accesso) per garantire la sicurezza del servizio.
        </p>

        <h2 className="text-xl font-bold mt-8">3. Finalità del trattamento</h2>
        <ul className="text-sm leading-relaxed mt-2 text-muted-foreground list-disc pl-5 space-y-1">
          <li>Erogazione del servizio Kicmatch e relativa gestione contrattuale</li>
          <li>Adempimenti fiscali e amministrativi</li>
          <li>Comunicazioni transazionali (conferme, ricevute, reminder)</li>
          <li>Sicurezza, prevenzione frodi e analisi tecniche</li>
          <li>Marketing diretto previo consenso esplicito</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">4. Base giuridica</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Trattiamo i dati sulla base del contratto di fornitura del servizio (art. 6.1.b GDPR), per adempiere a obblighi di legge (art. 6.1.c), per legittimo interesse (art. 6.1.f) o sulla base del tuo consenso (art. 6.1.a) per le finalità di marketing.
        </p>

        <h2 className="text-xl font-bold mt-8">5. Destinatari dei dati</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          I tuoi dati possono essere comunicati a fornitori che operano per nostro conto in qualità di Responsabili del Trattamento: provider cloud (hosting, database), provider di pagamento (Stripe), provider email transazionali (Resend). Nessun dato viene venduto a terzi.
        </p>

        <h2 className="text-xl font-bold mt-8">6. Conservazione</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Conserviamo i dati per il tempo necessario alle finalità per cui sono stati raccolti e nel rispetto dei termini di legge (10 anni per documenti fiscali). I dati di marketing vengono conservati fino alla revoca del consenso.
        </p>

        <h2 className="text-xl font-bold mt-8">7. Diritti dell'interessato</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Hai diritto di accesso, rettifica, cancellazione, limitazione, opposizione e portabilità dei tuoi dati. Per esercitare questi diritti scrivi tramite PEC a <a href="mailto:firefeed@pec.it" className="text-primary hover:underline">firefeed@pec.it</a>. Puoi anche presentare reclamo al Garante per la protezione dei dati personali.
        </p>

        <h2 className="text-xl font-bold mt-8">8. Modifiche</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Ci riserviamo di aggiornare questa informativa in qualsiasi momento. La versione corrente sarà sempre disponibile a questo indirizzo.
        </p>
      </article>
    </LandingShell>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/privacy",
  component: PrivacyPage,
});
