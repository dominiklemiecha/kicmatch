import { useMutation } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import { Building2, CreditCard, Landmark, Pencil, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { MeResponse } from "@kicmatch/shared";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/auth-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Route as RootRoute } from "./__root";

const COUNTRIES = ["Italia", "Svizzera", "Francia", "Germania", "Spagna", "Regno Unito"];

function SettingsPage(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [profileType, setProfileType] = useState<"PRIVATE" | "BUSINESS">(user?.profileType ?? "PRIVATE");
  const [profileName, setProfileName] = useState(user?.profileName ?? "");
  const [country, setCountry] = useState(user?.country ?? "Italia");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");
  const [ibanHolderDefault, setIbanHolderDefault] = useState(user?.ibanHolderDefault ?? "");
  const [ibanDefault, setIbanDefault] = useState(user?.ibanDefault ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setProfileType(user.profileType);
    setProfileName(user.profileName ?? "");
    setCountry(user.country ?? "Italia");
    setAvatarUrl(user.avatarUrl ?? null);
    setBio(user.bio ?? "");
    setWebsite(user.website ?? "");
    setIbanHolderDefault(user.ibanHolderDefault ?? "");
    setIbanDefault(user.ibanDefault ?? "");
  }, [user]);

  const updateMut = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const res = await api.patch<MeResponse>("/auth/me", patch);
      return res.data;
    },
    onSuccess: (data) => {
      if (user) setUser({ ...user, ...data });
      toast.success("Modifiche salvate");
    },
    onError: () => toast.error("Errore nel salvataggio"),
  });

  const onPickAvatar = async (file: File): Promise<void> => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const presign = await api.post<{ uploadUrl: string; publicUrl: string }>("/storage/presign", { contentType: file.type });
      await fetch(presign.data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setAvatarUrl(presign.data.publicUrl);
      updateMut.mutate({ avatarUrl: presign.data.publicUrl });
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = (): void => {
    updateMut.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      profileType,
      profileName: profileName.trim() || null,
      country,
      bio: bio.trim() || null,
      website: website.trim() || null,
    });
  };

  const saveIban = (): void => {
    updateMut.mutate({
      ibanDefault: ibanDefault.replace(/\s/g, "").toUpperCase() || null,
      ibanHolderDefault: ibanHolderDefault.trim() || null,
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestisci profilo, dati account e preferenze di pagamento</p>
      </div>

      {/* Avatar + nome */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><User className="h-4 w-4" /></div>
          <div className="font-semibold">Profilo</div>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 shrink-0">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-full w-full rounded-full bg-muted overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-white border-2 border-background flex items-center justify-center shadow"
              aria-label="Cambia foto"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPickAvatar(f);
            }}
          />
          <div className="flex-1 text-sm text-muted-foreground">
            Carica una foto profilo per personalizzare il tuo account.
            {uploading && <div className="text-xs mt-1">Caricamento…</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Nome <span className="text-red-500">*</span></Label>
            <Input className="mt-1" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label>Cognome <span className="text-red-500">*</span></Label>
            <Input className="mt-1" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Email</Label>
          <Input className="mt-1 bg-muted/50" value={user?.email ?? ""} readOnly />
          <p className="text-[11px] text-muted-foreground mt-1">L'email non è modificabile.</p>
        </div>

        <div>
          <Label>Tipologia di account</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <TypeButton icon={User} label="Privato" active={profileType === "PRIVATE"} onClick={() => setProfileType("PRIVATE")} />
            <TypeButton icon={Building2} label="Azienda" active={profileType === "BUSINESS"} onClick={() => setProfileType("BUSINESS")} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Nome profilo</Label>
            <Input className="mt-1" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Mostrato sulla pagina pubblica" />
          </div>
          <div>
            <Label>Paese</Label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <Label>Bio</Label>
          <textarea
            className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            rows={3}
            placeholder="Una breve descrizione di te o della tua attività"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div>
          <Label>Sito web o social</Label>
          <Input className="mt-1" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://instagram.com/..." />
        </div>

        <div className="flex justify-end">
          <Button onClick={saveProfile} disabled={updateMut.isPending}>
            {updateMut.isPending ? "Salvataggio…" : "Salva profilo"}
          </Button>
        </div>
      </Card>

      {/* IBAN payout */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Landmark className="h-4 w-4" /></div>
          <div>
            <div className="font-semibold">Dati di pagamento (payout)</div>
            <div className="text-xs text-muted-foreground">IBAN dove ricevere i bonifici. Verrà precompilato nelle richieste di payout.</div>
          </div>
        </div>
        <div>
          <Label>Intestatario IBAN</Label>
          <Input className="mt-1" value={ibanHolderDefault} onChange={(e) => setIbanHolderDefault(e.target.value)} placeholder="Mario Rossi o Nome Azienda" />
        </div>
        <div>
          <Label>IBAN</Label>
          <Input className="mt-1 font-mono" value={ibanDefault} onChange={(e) => setIbanDefault(e.target.value)} placeholder="IT60X0542811101000000123456" />
          <p className="text-[11px] text-muted-foreground mt-1">Senza spazi, formato internazionale</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={saveIban} disabled={updateMut.isPending}>
            {updateMut.isPending ? "Salvataggio…" : "Salva IBAN"}
          </Button>
        </div>
      </Card>

      {/* Piano */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><CreditCard className="h-4 w-4" /></div>
          <div>
            <div className="font-semibold">Piano attivo</div>
            <div className="text-xs text-muted-foreground">Il tuo piano corrente</div>
          </div>
        </div>
        <div className="rounded-lg bg-muted/30 border p-4">
          <div className="font-semibold text-sm">{user?.plan ?? "FREE"} PLAN</div>
          <div className="text-xs text-muted-foreground mt-1">Fee transazioni 8% (Carta/Apple Pay/Google Pay)</div>
        </div>
      </Card>
    </div>
  );
}

function TypeButton({ icon: Icon, label, active, onClick }: { icon: typeof User; label: string; active: boolean; onClick: () => void }): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors",
        active ? "border-primary bg-primary/5 text-primary" : "border-input hover:bg-accent/5",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/settings",
  component: SettingsPage,
});
