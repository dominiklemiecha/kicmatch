import { useQuery } from "@tanstack/react-query";
import { createRoute, useNavigate, useParams } from "@tanstack/react-router";
import { CheckCircle2, Copy, Facebook, Linkedin, Mail, MessageCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getEvent } from "@/features/events/events-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Route as RootRoute } from "./__root";

function EventPubblicatoPage(): JSX.Element {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ["event", id], queryFn: () => getEvent(id), enabled: Boolean(id) });

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const publicLink = query.data ? `${baseUrl}/e/${query.data.slug}` : "";

  const copyLink = (): void => {
    void navigator.clipboard.writeText(publicLink);
    toast.success("Link copiato");
  };

  const shareVia = (channel: "whatsapp" | "facebook" | "linkedin" | "email"): void => {
    const text = `Sei invitato a ${query.data?.name ?? "il nostro evento"}: ${publicLink}`;
    const url = encodeURIComponent(publicLink);
    const msg = encodeURIComponent(text);
    let target = "";
    if (channel === "whatsapp") target = `https://wa.me/?text=${msg}`;
    if (channel === "facebook") target = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (channel === "linkedin") target = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    if (channel === "email") target = `mailto:?subject=${encodeURIComponent(query.data?.name ?? "Evento")}&body=${msg}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <Card className="rounded-2xl border bg-card shadow-sm p-8 text-center space-y-6">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400" />
            <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-pink-400" />
            <Sparkles className="absolute -top-2 -left-3 h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evento pubblicato!</h1>
            <p className="text-sm text-muted-foreground mt-2">Il tuo evento è ora online e gli inviti sono stati inviati.</p>
          </div>

          <div className="text-left">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Link evento</div>
            <div className="flex gap-2">
              <Input readOnly value={publicLink} className="text-xs" />
              <Button variant="outline" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-left">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Condividi su</div>
            <div className="grid grid-cols-4 gap-2">
              <ShareButton icon={MessageCircle} label="WhatsApp" color="text-green-600" onClick={() => shareVia("whatsapp")} />
              <ShareButton icon={Facebook} label="Facebook" color="text-blue-600" onClick={() => shareVia("facebook")} />
              <ShareButton icon={Linkedin} label="LinkedIn" color="text-sky-700" onClick={() => shareVia("linkedin")} />
              <ShareButton icon={Mail} label="Email" color="text-gray-700" onClick={() => shareVia("email")} />
            </div>
          </div>

          <div className="border-t pt-5 space-y-2">
            <div className="text-sm font-semibold mb-2">Cosa vuoi fare ora?</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => void navigate({ to: "/events/$id", params: { id } })}>
                Vai alla dashboard
              </Button>
              <Button variant="outline" onClick={copyLink}>
                <Copy className="h-4 w-4" />
                Copia link
              </Button>
              <Button variant="outline" onClick={() => void navigate({ to: "/events/$id/inviti", params: { id } })}>
                <Send className="h-4 w-4" />
                Invia altri inviti
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

interface ShareButtonProps {
  icon: typeof Copy;
  label: string;
  color: string;
  onClick: () => void;
}

function ShareButton({ icon: Icon, label, color, onClick }: ShareButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 hover:bg-accent/5 transition-colors"
    >
      <Icon className={`h-5 w-5 ${color}`} />
      <span className="text-xs">{label}</span>
    </button>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/events/$id/pubblicato",
  component: EventPubblicatoPage,
});
