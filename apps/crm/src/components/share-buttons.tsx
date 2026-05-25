import { Copy, Facebook, Linkedin, Mail, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  url: string;
  title: string;
  compact?: boolean;
  className?: string;
}

interface Target {
  key: string;
  label: string;
  color: string;
  icon: typeof Copy;
  href: (url: string, title: string) => string;
}

const TARGETS: Target[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    color: "text-green-600 hover:bg-green-50",
    icon: MessageCircle,
    href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t}: ${u}`)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    color: "text-sky-500 hover:bg-sky-50",
    icon: Send,
    href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    color: "text-blue-600 hover:bg-blue-50",
    icon: Facebook,
    href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    color: "text-sky-700 hover:bg-sky-50",
    icon: Linkedin,
    href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    key: "email",
    label: "Email",
    color: "text-slate-600 hover:bg-slate-100",
    icon: Mail,
    href: (u, t) => `mailto:?subject=${encodeURIComponent(t)}&body=${encodeURIComponent(`${t}: ${u}`)}`,
  },
];

export function ShareButtons({ url, title, compact = false, className }: ShareButtonsProps): JSX.Element {
  const copyLink = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiato");
    } catch {
      toast.error("Impossibile copiare il link");
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {TARGETS.map((t) => {
          const Icon = t.icon;
          return (
            <a
              key={t.key}
              href={t.href(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Condividi su ${t.label}`}
              title={`Condividi su ${t.label}`}
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-card transition-colors",
                t.color,
              )}
            >
              <Icon className="h-4 w-4" />
            </a>
          );
        })}
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copia link"
          title="Copia link"
          className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-card text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-6 gap-2", className)}>
      {TARGETS.map((t) => {
        const Icon = t.icon;
        return (
          <a
            key={t.key}
            href={t.href(url, title)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border border-input bg-card p-3 transition-colors",
              t.color,
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs text-foreground">{t.label}</span>
          </a>
        );
      })}
      <button
        type="button"
        onClick={copyLink}
        className="flex flex-col items-center gap-1 rounded-lg border border-input bg-card p-3 text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <Copy className="h-5 w-5" />
        <span className="text-xs text-foreground">Copia link</span>
      </button>
    </div>
  );
}
