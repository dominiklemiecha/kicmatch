import { BarcodeFormat, BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";
import type { PluginListenerHandle } from "@capacitor/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import jsQR from "jsqr";
import { Camera, CameraOff, CheckCircle2, QrCode, RotateCcw, X, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isNative } from "@/lib/platform";

interface ScanResult {
  participantId: string;
  firstName: string;
  lastName: string;
  email: string;
  ticketCode: string | null;
  alreadyCheckedIn: boolean;
  checkedInAt: string | null;
}

interface CheckinPanelProps { eventId: string }

async function scanTicket(eventId: string, ticketCode: string): Promise<ScanResult> {
  const res = await api.post<ScanResult>(`/events/${eventId}/checkin/scan`, { ticketCode });
  return res.data;
}

async function getCheckinStats(eventId: string): Promise<{ total: number; checkedIn: number }> {
  const res = await api.get<{ total: number; checkedIn: number }>(`/events/${eventId}/checkin/stats`);
  return res.data;
}

export function CheckinPanel({ eventId }: CheckinPanelProps): JSX.Element {
  const qc = useQueryClient();
  const native = isNative();

  // web-only refs (jsQR scanner loop)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanRef = useRef<string>("");
  const lastScanAtRef = useRef<number>(0);

  const [cameraOn, setCameraOn] = useState(false);
  const [nativeScanning, setNativeScanning] = useState(false);
  const nativeListenerRef = useRef<PluginListenerHandle | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [lastResult, setLastResult] = useState<{ ok: boolean; message: string; participant?: ScanResult } | null>(null);

  const statsQ = useQuery({
    queryKey: ["checkin-stats", eventId],
    queryFn: () => getCheckinStats(eventId),
    enabled: Boolean(eventId),
    refetchInterval: 5000,
  });

  const scanMut = useMutation({
    mutationFn: (code: string) => scanTicket(eventId, code),
    onSuccess: (data) => {
      if (data.alreadyCheckedIn) {
        setLastResult({ ok: false, message: `${data.firstName} ${data.lastName} ha già fatto il check-in`, participant: data });
      } else {
        setLastResult({ ok: true, message: `Benvenuto ${data.firstName} ${data.lastName}!`, participant: data });
        void qc.invalidateQueries({ queryKey: ["checkin-stats", eventId] });
        toast.success(`Check-in: ${data.firstName} ${data.lastName}`);
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      setLastResult({ ok: false, message: error.response?.data?.message ?? "Errore scan" });
    },
  });

  const stopCamera = (): void => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const startWebCamera = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      scanLoop();
    } catch {
      toast.error("Impossibile accedere alla fotocamera. Verifica i permessi.");
    }
  };

  const scanLoop = (): void => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
        if (code?.data) {
          const now = Date.now();
          if (code.data !== lastScanRef.current || now - lastScanAtRef.current > 3000) {
            lastScanRef.current = code.data;
            lastScanAtRef.current = now;
            scanMut.mutate(code.data);
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(scanLoop);
  };

  /**
   * Native scanner using ML Kit's startScan API (bundled variant, no Play
   * Services dependency). The camera shows behind the WebView while we render
   * an overlay scan frame + cancel button in HTML.
   */
  const stopNativeScan = async (): Promise<void> => {
    try {
      await BarcodeScanner.stopScan();
    } catch {
      /* ignore */
    }
    try {
      await nativeListenerRef.current?.remove();
    } catch {
      /* ignore */
    }
    nativeListenerRef.current = null;
    document.body.classList.remove("kc-native-scan");
    setNativeScanning(false);
  };

  const scanNative = async (): Promise<void> => {
    try {
      const supported = await BarcodeScanner.isSupported();
      if (!supported.supported) {
        toast.error("Scanner non supportato su questo dispositivo");
        return;
      }
      const perm = await BarcodeScanner.checkPermissions();
      if (perm.camera !== "granted") {
        const req = await BarcodeScanner.requestPermissions();
        if (req.camera !== "granted") {
          toast.error("Permesso fotocamera negato");
          return;
        }
      }
      // Make the WebView transparent so the camera feed becomes visible.
      document.body.classList.add("kc-native-scan");
      setNativeScanning(true);

      nativeListenerRef.current = await BarcodeScanner.addListener("barcodeScanned", async (event) => {
        const value = event.barcode?.rawValue;
        if (!value) return;
        await stopNativeScan();
        scanMut.mutate(value);
      });
      await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });
    } catch (err) {
      await stopNativeScan();
      const msg = err instanceof Error ? err.message : "Errore scanner";
      toast.error(msg);
    }
  };

  useEffect(() => {
    return (): void => {
      stopCamera();
      void stopNativeScan();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManual = (): void => {
    if (!manualCode.trim()) return;
    scanMut.mutate(manualCode.trim());
    setManualCode("");
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <Card className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Check-in effettuati</div>
            <div className="text-3xl font-bold tracking-tight mt-1 text-primary">{statsQ.data?.checkedIn ?? 0}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground">Su totale partecipanti</div>
            <div className="text-3xl font-bold tracking-tight mt-1">{statsQ.data?.total ?? 0}</div>
          </div>
        </div>
      </Card>

      {/* Scanner */}
      {native ? (
        <Card className="p-6 text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <div>
            <div className="font-semibold">Scanner QR nativo</div>
            <p className="text-xs text-muted-foreground mt-1">
              Apri la fotocamera del telefono e inquadra il QR del partecipante
            </p>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => void scanNative()}
            disabled={scanMut.isPending}
          >
            <Camera className="h-5 w-5 mr-2" />
            {scanMut.isPending ? "Verifica in corso…" : "Scansiona QR"}
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="p-5 border-b">
            <div className="font-semibold">Scanner QR</div>
            <p className="text-xs text-muted-foreground mt-0.5">Inquadra il codice biglietto del partecipante</p>
          </div>
          <div className="relative bg-black aspect-square sm:aspect-video max-h-96">
            <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3">
                <Camera className="h-12 w-12" />
                <Button variant="secondary" onClick={() => void startWebCamera()}>Avvia fotocamera</Button>
              </div>
            )}
            {cameraOn && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-1/4 inset-y-1/4 border-2 border-primary/80 rounded-lg" />
              </div>
            )}
          </div>
          {cameraOn && (
            <div className="p-3 border-t flex justify-center">
              <Button variant="outline" size="sm" onClick={stopCamera}>
                <CameraOff className="h-4 w-4" /> Ferma fotocamera
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Last result */}
      {lastResult && (
        <Card className={`p-5 border-2 ${lastResult.ok ? "border-green-500 bg-green-50" : "border-red-300 bg-red-50"}`}>
          <div className="flex items-start gap-3">
            {lastResult.ok ? <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" /> : <XCircle className="h-6 w-6 text-red-600 mt-0.5" />}
            <div className="flex-1">
              <div className="font-semibold">{lastResult.message}</div>
              {lastResult.participant && (
                <div className="text-sm text-muted-foreground mt-1">
                  {lastResult.participant.email} · <span className="font-mono text-xs">{lastResult.participant.ticketCode}</span>
                </div>
              )}
            </div>
            <button onClick={() => setLastResult(null)} className="text-muted-foreground hover:text-foreground p-1">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Manual */}
      <Card className="p-5 space-y-3">
        <div className="font-semibold text-sm">Inserimento manuale</div>
        <p className="text-xs text-muted-foreground">Inserisci il codice se non riesci a scansionare il QR</p>
        <div className="flex gap-2">
          <Input
            placeholder="KIC-XXXX-XXXX-XXXX"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleManual(); }}
            className="font-mono"
          />
          <Button onClick={handleManual} disabled={!manualCode.trim() || scanMut.isPending}>Conferma</Button>
        </div>
      </Card>

      {/* Native scanner overlay (camera shows under transparent WebView) */}
      {nativeScanning && (
        <div className="kc-scan-overlay">
          <div className="kc-scan-frame" />
          <div className="kc-scan-hint">Inquadra il QR del partecipante</div>
          <button
            type="button"
            onClick={() => void stopNativeScan()}
            className="kc-scan-cancel"
            aria-label="Annulla scansione"
          >
            <X className="h-5 w-5" /> Annulla
          </button>
        </div>
      )}
    </div>
  );
}
