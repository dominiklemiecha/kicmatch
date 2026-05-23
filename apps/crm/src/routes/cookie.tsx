import { createRoute } from "@tanstack/react-router";
import { LandingShell } from "@/features/landing/landing-shell";
import { Route as RootRoute } from "./__root";

function CookiePage(): JSX.Element {
  return (
    <LandingShell>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Ultimo aggiornamento: 22 maggio 2025</p>

        <h2 className="text-xl font-bold mt-8">Cosa sono i cookie</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          I cookie sono piccoli file di testo che i siti visitati inviano e registrano sul terminale dell'utente, per essere poi ritrasmessi agli stessi siti alla successiva visita. Sono utilizzati per eseguire autenticazioni informatiche, monitoraggio di sessioni e memorizzazione di informazioni utili.
        </p>

        <h2 className="text-xl font-bold mt-8">Cookie utilizzati da Kicmatch</h2>

        <h3 className="text-base font-semibold mt-5">Cookie tecnici (sempre attivi)</h3>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Necessari al funzionamento del sito. Non richiedono consenso ai sensi dell'art. 122 del Codice Privacy.
        </p>
        <div className="mt-3 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="rounded-lg border overflow-hidden min-w-[480px] sm:min-w-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-semibold">Nome</th>
                <th className="text-left p-3 font-semibold">Scopo</th>
                <th className="text-left p-3 font-semibold">Durata</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-t">
                <td className="p-3 font-mono text-xs">kicmatch_refresh</td>
                <td className="p-3">Mantiene la sessione autenticata</td>
                <td className="p-3">30 giorni</td>
              </tr>
              <tr className="border-t">
                <td className="p-3 font-mono text-xs">__stripe_*</td>
                <td className="p-3">Stripe — prevenzione frodi pagamenti</td>
                <td className="p-3">Sessione / 1 anno</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        <h3 className="text-base font-semibold mt-6">Cookie analitici</h3>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Usati in forma aggregata per misurare il traffico del sito e migliorare le prestazioni. Attualmente Kicmatch non utilizza strumenti di analisi di terze parti che richiedano consenso.
        </p>

        <h3 className="text-base font-semibold mt-6">Cookie di profilazione</h3>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Kicmatch non utilizza cookie di profilazione o marketing.
        </p>

        <h2 className="text-xl font-bold mt-8">Come gestire i cookie</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Puoi bloccare o eliminare i cookie modificando le impostazioni del tuo browser. Disabilitando i cookie tecnici alcune funzioni del sito potrebbero non funzionare correttamente (per esempio l'accesso al tuo account). Istruzioni:
        </p>
        <ul className="text-sm leading-relaxed mt-2 text-muted-foreground list-disc pl-5 space-y-1">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/it/kb/cookie-informazioni-che-i-siti-web-archiviano" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/it-it/HT201265" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></li>
          <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Microsoft Edge</a></li>
        </ul>

        <h2 className="text-xl font-bold mt-8">Contatti</h2>
        <p className="text-sm leading-relaxed mt-2 text-muted-foreground">
          Per domande sulla cookie policy scrivi tramite PEC a <a href="mailto:firefeed@pec.it" className="text-primary hover:underline">firefeed@pec.it</a>.
        </p>
      </article>
    </LandingShell>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/cookie",
  component: CookiePage,
});
