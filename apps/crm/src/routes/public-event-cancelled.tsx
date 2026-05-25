import { createRoute, useParams } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Route as RootRoute } from "./__root";

function CancelledPage(): JSX.Element {
  const { slug } = useParams({ strict: false }) as { slug: string };
  return (
    <PublicShell containerClassName="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="p-8 text-center space-y-5">
          <div className="mx-auto h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pagamento annullato</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Hai annullato il pagamento. La tua iscrizione è in attesa: puoi riprovare quando vuoi.
            </p>
          </div>
          <a href={`/e/${slug}`}>
            <Button className="w-full">Torna alla pagina evento</Button>
          </a>
        </Card>
      </div>
    </PublicShell>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/e/$slug/cancelled",
  component: CancelledPage,
});
