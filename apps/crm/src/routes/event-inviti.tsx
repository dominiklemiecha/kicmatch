import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import { EventWizardShell } from "@/features/events/event-wizard-shell";
import { InvitationsPanel } from "@/features/events/invitations-panel";
import { Button } from "@/components/ui/button";
import { Route as RootRoute } from "./__root";

function EventInvitiPage(): JSX.Element {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  return (
    <EventWizardShell
      eventId={id}
      currentStep={2}
      title="Inviti"
      subtitle="Scegli come invitare le persone"
    >
      <InvitationsPanel eventId={id} hideReminder />
      <div className="flex justify-between gap-2 pt-2">
        <Button variant="ghost" onClick={() => void navigate({ to: "/events" })}>Annulla</Button>
        <Button onClick={() => void navigate({ to: "/events/$id/modulo", params: { id } })}>Continua</Button>
      </div>
    </EventWizardShell>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/events/$id/inviti",
  component: EventInvitiPage,
});
