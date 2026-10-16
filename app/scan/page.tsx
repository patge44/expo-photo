'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ScanLine, Camera, CameraOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import jsQR from 'jsqr';

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const navigatingRef = useRef(false);

  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Un QR ne doit mener QUE vers une page œuvre de CE site.
  // TEMPORAIRE (diagnostic) : affiche la raison exacte du refus au lieu
  // de refuser en silence. À repasser en version sobre après diagnostic.
  const resolveArtworkUrl = (text: string): { url: string } | { reason: string } => {
    let url: URL;
    try {
      url = new URL(text);
    } catch {
      return { reason: `Ce n'est pas une URL. Contenu lu : « ${text.slice(0, 60)} »` };
    }
    if (url.origin !== window.location.origin) {
      return { reason: `Origine différente. Lu : « ${url.origin} » — attendu : « ${window.location.origin} »` };
    }
    const m = url.pathname.match(/^\/audio\/([0-9a-f-]{36})$/i);
    if (!m) {
      return { reason: `Chemin non reconnu : « ${url.pathname} »` };
    }
    return { url: `/audio/${m[1]}` };
  };

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setStatus('starting');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, // caméra arrière
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus('scanning');
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError("L'accès à la caméra a été refusé. Autorisez la caméra dans votre navigateur, ou utilisez la galerie.");
      } else if (err?.name === 'NotFoundError') {
        setError("Aucune caméra détectée sur cet appareil. Utilisez la galerie pour choisir une œuvre.");
      } else {
        setError("Impossible d'activer la caméra. Utilisez la galerie pour choisir une œuvre.");
      }
      setStatus('error');
    }
  }, []);

  // Boucle de décodage : on prélève des images de la vidéo et on les passe à jsQR.
  useEffect(() => {
    if (status !== 'scanning') return;

    const tick = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w && h) {
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
          ctx.drawImage(video, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });

          if (code?.data && !navigatingRef.current) {
            const result = resolveArtworkUrl(code.data);
            if ('url' in result) {
              navigatingRef.current = true;
              stopCamera();
              router.push(result.url);
              return;
            } else {
              // QR lu mais pas une œuvre : raison affichée, sans spammer.
              navigatingRef.current = true;
              setError(result.reason); // TEMPORAIRE : raison détaillée
              setTimeout(() => { navigatingRef.current = false; }, 3000);
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [status, router, stopCamera]);

  // Arrêt propre en quittant la page.
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col p-6 overflow-x-hidden selection:bg-primary-500/30">
      <header className="flex items-center justify-between mb-8 z-10">
        <Link
          href="/gallery"
          className="p-3 rounded-full bg-slate-900 border border-slate-800 accessible-focus transition-transform active:scale-95 group"
          aria-label="Retour à la galerie"
          title="Retour à la galerie"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div className="flex items-center gap-2 text-primary-400 font-bold uppercase tracking-[0.2em] text-[10px]">
          <ScanLine size={14} />
          <span>Scanner une œuvre</span>
        </div>
        <div className="w-12 h-12" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full z-10 text-center">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-4">
          Scannez le QR code du cartel
        </h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          Placez le QR code de la photo dans le cadre — l'audiodescription démarre automatiquement.
        </p>

        {/* Cadre de visée */}
        <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden bg-slate-900 border-4 border-slate-800 shadow-2xl">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            aria-label="Flux caméra pour scanner le QR code"
          />
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

          {status === 'scanning' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 rounded-2xl border-2 border-primary-500/60" />
            </div>
          )}

          {status !== 'scanning' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
              <CameraOff size={48} className="text-slate-600" />
              <p className="text-sm text-slate-500">Caméra inactive</p>
            </div>
          )}
        </div>

        {/* Zone d'état / erreurs / boutons */}
        <div className="mt-10 w-full space-y-4">
          {status === 'starting' && (
            <p className="text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={18} /> Activation de la caméra…
            </p>
          )}

          {error && (
            <p role="alert" className="text-amber-400 font-medium">{error}</p>
          )}

          {status !== 'scanning' && (
            <button
              onClick={startCamera}
              className="w-full px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all active:scale-95 accessible-focus inline-flex items-center justify-center gap-3"
              aria-label="Activer la caméra pour scanner"
            >
              <Camera size={22} />
              Activer la caméra
            </button>
          )}

          {status === 'scanning' && (
            <button
              onClick={() => { stopCamera(); setStatus('idle'); }}
              className="w-full px-8 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl font-bold transition-all accessible-focus"
              aria-label="Arrêter la caméra"
            >
              Arrêter la caméra
            </button>
          )}

          <Link
            href="/gallery"
            className="block text-slate-400 hover:text-white font-medium transition-colors underline underline-offset-4"
          >
            Ou choisir une œuvre dans la galerie
          </Link>
        </div>
      </div>

      <footer className="mt-16 py-8 text-center border-t border-white/5 opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">
          L'audiodescription commence dès le scan
        </p>
      </footer>
    </main>
  );
}