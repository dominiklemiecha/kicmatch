interface BaseEvent {
  name: string;
  startAt: Date;
  endAt?: Date | null;
  locationType: "PHYSICAL" | "ONLINE";
  locationName: string | null;
  locationAddress?: string | null;
  onlineUrl: string | null;
  coverImageUrl?: string | null;
  slug?: string;
}

interface Participant {
  firstName: string;
  ticketCode: string | null;
}

function appUrl(): string {
  return process.env.APP_PUBLIC_URL || "https://kicmatch.com";
}

function shell(title: string, body: string, preheader = ""): string {
  return `<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;line-height:1.55">
${preheader ? `<div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${preheader}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f5f9;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:94%;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0">
<tr><td style="padding:24px 24px 0;text-align:center">
<div style="display:inline-block;font-size:22px;font-weight:800;color:#7c3aed;letter-spacing:-0.02em">kicmatch</div>
</td></tr>
<tr><td style="padding:20px 24px 28px">${body}</td></tr>
<tr><td style="padding:18px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8">
Email automatica da <strong style="color:#475569">Kicmatch</strong> · non rispondere<br>Un prodotto di Fire Feed S.r.l. · Roma, IT
</td></tr></table>
</td></tr></table>
</body></html>`;
}

function isPublicUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /^https?:\/\//.test(url) && !/localhost|127\.0\.0\.1|::1|\bminio\b/.test(url);
}

function coverBlock(event: BaseEvent): string {
  if (!isPublicUrl(event.coverImageUrl)) return "";
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px">
    <tr><td>
      <img src="${event.coverImageUrl}" alt="${event.name}" width="512" style="display:block;width:100%;max-width:100%;height:auto;border-radius:10px;border:0;outline:none" />
    </td></tr>
  </table>`;
}

function eventInfoCard(event: BaseEvent): string {
  const dt = event.startAt.toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" });
  const loc =
    event.locationType === "ONLINE"
      ? `Online${event.onlineUrl ? ` · <a href="${event.onlineUrl}" style="color:#7c3aed;text-decoration:none">Link</a>` : ""}`
      : [event.locationName, event.locationAddress].filter(Boolean).join(" · ") || "—";
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px">
    <tr><td style="padding:16px 18px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:6px 0;width:90px;vertical-align:top;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">📅 Quando</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a">${dt}</td>
        </tr>
        <tr><td colspan="2" style="height:6px;border-top:1px solid #e2e8f0;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr>
          <td style="padding:6px 0;width:90px;vertical-align:top;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">📍 Dove</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;color:#0f172a">${loc}</td>
        </tr>
      </table>
    </td></tr>
  </table>`;
}

export function ticketCardWithQr(ticketCode: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 20px;background:#0b0518;border-radius:14px">
    <tr><td style="padding:24px 20px;text-align:center;color:#fff">
      <div style="font-size:11px;color:#a78bfa;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">Codice partecipante</div>
      <div style="font-family:'SF Mono',monospace;font-size:18px;font-weight:bold;color:#fff;margin-top:8px;letter-spacing:0.02em">${ticketCode}</div>
      <div style="display:inline-block;margin-top:6px;padding:3px 10px;background:rgba(16,185,129,0.15);color:#34d399;border-radius:999px;font-size:11px;font-weight:600">✓ Biglietto valido</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px auto 6px"><tr><td>
        <div style="background:#fff;padding:12px;border-radius:10px;display:inline-block">
          <img src="cid:ticket-qr" alt="QR" width="180" height="180" style="display:block;width:180px;height:180px;border:0" />
        </div>
      </td></tr></table>
      <div style="font-size:12px;color:#cbd5e1;margin-top:10px">Scansiona il QR code per il check-in</div>
    </td></tr>
  </table>`;
}

function ticketCard(ticketCode: string, color: "primary" | "success" = "primary"): string {
  const colors = color === "success"
    ? { bg: "#f0fdf4", border: "#bbf7d0", label: "#16a34a" }
    : { bg: "#faf5ff", border: "#e9d5ff", label: "#7c3aed" };
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 20px;background:${colors.bg};border:1px solid ${colors.border};border-radius:12px">
    <tr><td style="padding:20px;text-align:center">
      <div style="font-size:11px;color:${colors.label};text-transform:uppercase;letter-spacing:0.08em;font-weight:700">Codice partecipante</div>
      <div style="font-family:'SF Mono','Menlo','Courier New',monospace;font-size:22px;font-weight:bold;color:#0f172a;margin-top:8px;letter-spacing:0.02em">${ticketCode}</div>
      <div style="font-size:12px;color:#64748b;margin-top:8px">Mostra questo codice all'ingresso</div>
    </td></tr>
  </table>`;
}

function button(href: string, label: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px auto"><tr><td>
    <a class="btn" href="${href}" style="display:inline-block;padding:14px 32px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;mso-padding-alt:0;text-align:center">${label}</a>
  </td></tr></table>`;
}

function successIcon(): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 12px"><tr><td>
    <div style="width:56px;height:56px;border-radius:50%;background:#dcfce7;text-align:center;line-height:56px;font-size:30px;color:#16a34a;font-weight:bold">✓</div>
  </td></tr></table>`;
}

export function rsvpConfirmationEmail(event: BaseEvent, p: Participant): string {
  const body = `
    ${coverBlock(event)}
    ${successIcon()}
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;text-align:center;color:#0f172a;line-height:1.2">Iscrizione confermata!</h1>
    <p style="margin:0 0 20px;color:#475569;text-align:center;font-size:15px">Ciao ${p.firstName}, sei iscritto a <strong style="color:#0f172a">${event.name}</strong>.</p>
    ${eventInfoCard(event)}
    <p style="margin:18px 0 0;color:#64748b;font-size:13px;text-align:center">A breve riceverai una seconda email con il <strong style="color:#0f172a">QR code per il check-in</strong>.</p>
  `;
  return shell("Iscrizione confermata", body, `Sei iscritto a ${event.name}`);
}

export function reminderInviteEmail(eventName: string, eventDate: Date, locationLabel: string, inviteUrl: string, coverImageUrl: string | null = null): string {
  const event: BaseEvent = {
    name: eventName, startAt: eventDate, locationType: "PHYSICAL", locationName: locationLabel, onlineUrl: null, coverImageUrl,
  };
  const body = `
    ${coverBlock(event)}
    <h1 class="h1" style="margin:0 0 8px;font-size:24px;font-weight:700;text-align:center;color:#0f172a;line-height:1.2">Ti aspettiamo! ⏰</h1>
    <p style="margin:0 0 20px;color:#475569;text-align:center;font-size:15px">Non hai ancora confermato per <strong style="color:#0f172a">${eventName}</strong>. I posti stanno per esaurirsi!</p>
    ${eventInfoCard(event)}
    ${button(inviteUrl, "Conferma partecipazione")}
    <p style="margin:24px 0 0;color:#64748b;font-size:13px;text-align:center">A presto!</p>
  `;
  return shell("Promemoria evento", body, `Conferma la tua partecipazione a ${eventName}`);
}

export function paymentConfirmationEmail(event: BaseEvent, p: Participant, amountCents: number, currency: string): string {
  const amount = new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(amountCents / 100);
  const body = `
    ${coverBlock(event)}
    ${successIcon()}
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;text-align:center;color:#0f172a;line-height:1.2">Pagamento ricevuto</h1>
    <p style="margin:0 0 20px;color:#475569;text-align:center;font-size:15px">Ciao ${p.firstName}, abbiamo ricevuto <strong style="color:#0f172a">${amount}</strong> per <strong style="color:#0f172a">${event.name}</strong>.</p>
    ${eventInfoCard(event)}
    <p style="margin:18px 0 0;color:#64748b;font-size:13px;text-align:center">A breve riceverai una seconda email con il <strong style="color:#0f172a">QR code per il check-in</strong>.</p>
  `;
  return shell("Pagamento ricevuto", body, `Pagamento di ${amount} ricevuto`);
}

export function ticketEmail(event: BaseEvent, p: Participant): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;text-align:center;color:#0f172a;line-height:1.2">Il tuo biglietto</h1>
    <p style="margin:0 0 18px;color:#475569;text-align:center;font-size:14px">Ecco il QR code per il check-in di <strong style="color:#0f172a">${event.name}</strong>.</p>
    ${p.ticketCode ? ticketCardWithQr(p.ticketCode) : ""}
    <p style="margin:18px 0 0;color:#64748b;font-size:13px;text-align:center">Mostra il QR all'ingresso. Puoi salvare questa email o fare uno screenshot.</p>
  `;
  return shell("Il tuo biglietto", body, `QR code per ${event.name}`);
}

export function invitationEmail(event: BaseEvent, organizerName: string, inviteUrl: string, recipientName?: string): string {
  const dateLine = event.startAt.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const locLine = event.locationType === "ONLINE" ? "Online" : (event.locationName ?? "");
  const subtitle = [dateLine, locLine].filter(Boolean).join(" · ");
  const greeting = recipientName ? `Ciao ${recipientName},` : "Ciao,";
  const body = `
    <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;text-align:center;color:#0f172a;line-height:1.3">Sei invitato a<br>${event.name}</h1>
    <p style="margin:0 0 18px;color:#7c3aed;text-align:center;font-size:13px;font-weight:600">${subtitle}</p>
    ${coverBlock(event)}
    <p style="margin:0 0 6px;color:#0f172a;font-size:15px;font-weight:600">${greeting}</p>
    <p style="margin:0 0 22px;color:#475569;font-size:14px;line-height:1.6">${organizerName} ti ha invitato a partecipare a un evento esclusivo. Conferma la tua partecipazione per riservare il tuo posto.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;width:100%"><tr><td>
      <a href="${inviteUrl}" style="display:block;padding:14px 24px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;text-align:center">Conferma la partecipazione</a>
    </td></tr></table>
    <p style="margin:18px 0 0;color:#94a3b8;font-size:11px;text-align:center;word-break:break-all">Se il pulsante non funziona, copia questo link nel browser:<br><span style="color:#64748b">${inviteUrl}</span></p>
  `;
  return shell("Sei invitato", body, `${organizerName} ti invita a ${event.name}`);
}

export function passwordResetEmail(firstName: string, resetUrl: string): string {
  const body = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 12px"><tr><td>
      <div style="width:56px;height:56px;border-radius:50%;background:#ede9fe;text-align:center;line-height:56px;font-size:24px">🔒</div>
    </td></tr></table>
    <h1 class="h1" style="margin:0 0 8px;font-size:24px;font-weight:700;text-align:center;color:#0f172a;line-height:1.2">Reimposta la tua password</h1>
    <p style="margin:0 0 20px;color:#475569;text-align:center;font-size:15px">Ciao ${firstName}, hai richiesto di reimpostare la password del tuo account Kicmatch. Clicca il pulsante qui sotto per scegliere una nuova password.</p>
    ${button(resetUrl, "Reimposta password")}
    <p style="margin:24px 0 6px;color:#64748b;font-size:13px;text-align:center">Il link è valido per <strong style="color:#0f172a">1 ora</strong> e può essere usato una sola volta.</p>
    <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center">Se non sei stato tu, ignora questa email: nessuna modifica verrà effettuata.</p>
  `;
  return shell("Reimposta password Kicmatch", body, "Link per reimpostare la tua password");
}

export function welcomeOrganizerEmail(firstName: string, dashboardUrl: string): string {
  const body = `
    <h1 class="h1" style="margin:0 0 8px;font-size:24px;font-weight:700;text-align:center;color:#0f172a;line-height:1.2">Benvenuto su Kicmatch, ${firstName}! 👋</h1>
    <p style="margin:0 0 20px;color:#475569;text-align:center;font-size:15px">Il tuo account è pronto. Inizia subito a creare il tuo primo evento.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 20px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px">
      <tr><td style="padding:18px 20px">
        <div style="font-size:13px;font-weight:600;color:#7c3aed;margin-bottom:10px">Cosa puoi fare ora:</div>
        <ul style="margin:0;padding-left:20px;color:#475569;font-size:14px;line-height:1.8">
          <li>Crea eventi gratuiti o a pagamento</li>
          <li>Invita partecipanti via email, CSV o link</li>
          <li>Personalizza il modulo di iscrizione</li>
          <li>Gestisci check-in con QR code</li>
        </ul>
      </td></tr>
    </table>
    ${button(dashboardUrl, "Vai alla dashboard")}
    <p style="margin:24px 0 0;color:#64748b;font-size:13px;text-align:center">Hai bisogno di aiuto? Scrivici a <a href="mailto:info@kicmatch.com" style="color:#7c3aed">info@kicmatch.com</a></p>
  `;
  return shell("Benvenuto su Kicmatch", body, "Il tuo account Kicmatch è pronto");
}

export function payoutPaidEmail(firstName: string, amountCents: number, currency: string, iban: string): string {
  const amount = new Intl.NumberFormat("it-IT", { style: "currency", currency }).format(amountCents / 100);
  const ibanMasked = iban.length > 8 ? `${iban.slice(0, 4)} **** **** ${iban.slice(-4)}` : iban;
  const body = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 12px"><tr><td>
      <div style="width:56px;height:56px;border-radius:50%;background:#dcfce7;text-align:center;line-height:56px;font-size:24px">💸</div>
    </td></tr></table>
    <h1 class="h1" style="margin:0 0 8px;font-size:24px;font-weight:700;text-align:center;color:#0f172a;line-height:1.2">Bonifico inviato</h1>
    <p style="margin:0 0 20px;color:#475569;text-align:center;font-size:15px">Ciao ${firstName}, abbiamo eseguito il bonifico di <strong style="color:#0f172a">${amount}</strong>.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px">
      <tr><td style="padding:18px 20px;text-align:center">
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:600">Importo</div>
        <div style="font-size:24px;font-weight:700;color:#16a34a;margin-top:4px">${amount}</div>
        <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-top:14px">IBAN destinazione</div>
        <div style="font-family:'SF Mono',monospace;font-size:14px;color:#0f172a;margin-top:4px">${ibanMasked}</div>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;color:#64748b;font-size:13px;text-align:center">Il bonifico potrebbe richiedere 1-3 giorni lavorativi.</p>
  `;
  return shell("Bonifico inviato", body, `${amount} in arrivo sul tuo conto`);
}
