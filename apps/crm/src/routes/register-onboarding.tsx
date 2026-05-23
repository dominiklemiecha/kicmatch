import { createRoute, useNavigate } from "@tanstack/react-router";
import { Pencil, User } from "lucide-react";
import { useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/auth-store";
import { useOnboardingStore } from "@/features/onboarding/onboarding-store";
import { Route as RootRoute } from "./__root";

function RegisterOnboardingPage(): JSX.Element {
  const navigate = useNavigate();
  const reset = useOnboardingStore((s) => s.reset);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onPickFile = async (file: File): Promise<void> => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const presign = await api.post<{ uploadUrl: string; publicUrl: string }>("/storage/presign", { contentType: file.type });
      await fetch(presign.data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setAvatarUrl(presign.data.publicUrl);
    } finally {
      setUploading(false);
    }
  };

  const finish = async (saveProfile: boolean): Promise<void> => {
    setSubmitting(true);
    try {
      if (saveProfile && (avatarUrl || bio || website)) {
        const res = await api.patch<{ id: string; email: string; firstName: string; lastName: string; profileType: "PRIVATE" | "BUSINESS"; plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE"; stripeOnboarded: boolean; emailVerified: boolean; role: "ORGANIZER" | "SUPERADMIN" }>("/auth/me", {
          avatarUrl: avatarUrl ?? undefined,
          bio: bio || undefined,
          website: website || undefined,
        });
        if (user) setUser({ ...user, ...res.data });
      }
      reset();
      void navigate({ to: "/dashboard" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
            <span className="rounded-full bg-white/20 px-2 py-0.5">8</span>
            Onboarding rapido
          </div>
          <p className="text-xs text-muted-foreground mt-2">Qualche info in più (opzionale)</p>
        </div>
        <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold">Completa il tuo profilo</div>
            <div className="text-xs font-semibold text-primary">Step 8 di 8</div>
          </div>

          <div>
            <Label className="text-sm">Carica un'immagine <span className="text-muted-foreground font-normal">(opzionale)</span></Label>
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative h-24 w-24 rounded-full bg-muted overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
                <span className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-white border flex items-center justify-center shadow-sm">
                  <Pencil className="h-3.5 w-3.5 text-foreground" />
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPickFile(f);
                }}
              />
            </div>
            {uploading && <p className="text-center text-xs text-muted-foreground mt-2">Caricamento…</p>}
          </div>

          <div>
            <Label className="text-sm">Bio <span className="text-muted-foreground font-normal">(opzionale)</span></Label>
            <textarea
              className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
              placeholder="Organizzo eventi per condividere passioni e creare connessioni."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm">Sito web o social <span className="text-muted-foreground font-normal">(opzionale)</span></Label>
            <Input
              className="mt-2"
              type="url"
              placeholder="https://instagram.com/kicracing"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <p className="text-xs text-primary">Potrai modificare tutto in seguito.</p>

          <Button onClick={() => void finish(true)} className="w-full" size="lg" disabled={submitting || uploading}>
            {submitting ? "Salvataggio…" : "Completa profilo"}
          </Button>
          <button
            type="button"
            onClick={() => void finish(false)}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
            disabled={submitting}
          >
            Salta per ora
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/register/onboarding",
  component: RegisterOnboardingPage,
});
