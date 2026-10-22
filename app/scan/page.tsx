'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ScanLine, Camera, CameraOff, Loader2, Hash } from 'lucide-react';
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

  // Annonces pour les lecteurs d'écran (aria-live) — aussi affichées à l'écran.
  const [liveMessage, setLiveMessage] = useState('');

  // Saisie du numéro (alternative accessible au scanner).
  const [numberInput, setNumberInput] = useState('');
  const [numberStatus, setNumberStatus] = useState<'idle' | 'searching' | 'error'>('idle');
  const [numberError, setNumberError] = useState<string | null>(null);

  // Un QR doit mener vers une page œuvre de CE site uniquement.
  // (Pas d'origines historiques : les anciens QR Vercel n'ont jamais été
  // diffusés au-dehors — décision de Patrick le 16/10.)
  const resolveArtworkUrl = (text: string): { url: string } | { reason: string } => {
    let url: URL;
    try {
      url = new URL(text);
    } catch {
      return { reason: "Ce QR code ne correspond pas à une œuvre de l'exposition." };
    }
    if (url.origin !== window.location.origin) {
      return { reason: "Ce QR code ne correspond pas à une œuvre de l'exposition." };
    }
    const m = url.pathname.match(/^\/audio\/([0-9a-f-]{36})$/i);
    if (!m) {
      return { reason: "Ce QR code ne correspond pas à une œuvre de l'exposition." };
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
    setLiveMessage("Activation de la caméra…");
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
      setLiveMessage(
        "Caméra activée. Présentez le QR code du cartel devant l'objectif."
      );
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError("L'accès à la caméra a été refusé. Autorisez la caméra dans votre navigateur, ou choisissez une autre option ci-dessus.");
        setLiveMessage("Accès à la caméra refusé. Utilisez la saisie du numéro ou la galerie.");
      } else if (err?.name === 'NotFoundError') {
        setError("Aucune caméra détectée sur cet appareil. Utilisez la saisie du numéro ou la galerie.");
        setLiveMessage("Aucune caméra détectée. Utilisez la saisie du numéro ou la galerie.");
      } else {
        setError("Impossible d'activer la caméra. Utilisez la saisie du numéro ou la galerie.");
        setLiveMessage("Impossible d'activer la caméra. Utilisez la saisie du numéro ou la galerie.");
      }
      setStatus('error');
    }
  }, []);

  // Saisie du numéro → recherche de l'œuvre publiée → navigation.
  const handleNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = numberInput.trim();
    if (!trimmed || numberStatus === 'searching') return;

    setNumberStatus('searching');
    setNumberError(null);
    setLiveMessage("Recherche de l'œuvre numéro " + trimmed + "…");

    try {
      const res = await fetch(`/api/artworks?number=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const artwork = await res.json();
        setLiveMessage(
          "Œuvre trouvée : " + (artwork.title || trimmed) + ". Ouverture de l'audiodescription."
        );
        router.push(`/audio/${artwork.id}`);
      } else if (res.status === 404) {
        setNumberStatus('error');
        setNumberError("Aucune œuvre publiée ne porte le numéro " + trimmed + ".");
        setLiveMessage("Aucune œuvre publiée ne porte le numéro " + trimmed + ".");
      } else {
        setNumberStatus('error');
        setNumberError("Erreur serveur. Vérifiez la connexion puis réessayez.");
        setLiveMessage("Erreur serveur. Réessayez.");
      }
    } catch {
      setNumberStatus('error');
      setNumberError("Erreur réseau. Vérifiez la connexion puis réessayez.");
      setLiveMessage("Erreur réseau. Réessayez.");
    }
  };

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
              setLiveMessage("QR code reconnu. Ouverture de l'audiodescription.");
              stopCamera();
              router.push(result.url);
              return;
            } else {
              // QR lu mais pas une œuvre : raison sobre, sans spammer.
              navigatingRef.current = true;
              setError(result.reason);
              setLiveMessage("QR code lu mais non reconnu. " + result.reason);
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
        <div className="w-12 h-12" aria-hidden="true" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full z-10 text-center">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-4">
          Ouvrir une œuvre
        </h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          Deux façons d'écouter l'audiodescription d'une photo.
        </p>

        {/* ── Option 1 : saisie du numéro (recommandée lecteurs d'écran) ── */}
        <section aria-labelledby="by-number-title" className="w-full mb-10 text-left">
          <h2
            id="by-number-title"
            className="text-lg font-bold mb-2 flex items-center gap-2"
          >
            <Hash size={18} className="text-primary-400 shrink-0" aria-hidden="true" />
            Saisir le numéro de l'œuvre
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Le numéro est imprimé sur le cartel, sous la photo.
          </p>
          <form onSubmit={handleNumberSubmit} className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="artwork-number" className="sr-only">
              Numéro de l'œuvre
            </label>
            <input
              id="artwork-number"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={numberInput}
              onChange={e => setNumberInput(e.target.value)}
              placeholder="Par exemple : 12"
              aria-describedby="number-help"
              className="flex-1 px-5 py-4 bg-slate-900 border border-slate-700 rounded-2xl text-lg font-bold placeholder:text-slate-600 focus:outline-none focus:border-primary-500 accessible-focus"
            />
            <button
              type="submit"
              disabled={numberStatus === 'searching'}
              className="px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all active:scale-95 accessible-focus inline-flex items-center justify-center gap-2"
              aria-label="Écouter l'audiodescription du numéro saisi"
            >
              {numberStatus === 'searching' && (
                <Loader2 className="animate-spin" size={20} aria-hidden="true" />
              )}
              Écouter
            </button>
          </form>
          <p id="number-help" className="sr-only">
            Tapez le numéro affiché sur le cartel puis choisissez Écouter.
          </p>
          {numberError && (
            <p role="alert" className="mt-3 text-amber-400 font-medium text-sm">
              {numberError}
            </p>
          )}
        </section>

        {/* ── Option 2 : scanner le QR code ── */}
        <section aria-labelledby="by-qr-title" className="w-full text-left">
          <h2 id="by-qr-title" className="text-lg font-bold mb-2 flex items-center gap-2">
            <Camera size={18} className="text-primary-400 shrink-0" aria-hidden="true" />
            Scanner le QR code
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Placez le QR code du cartel dans le cadre — l'audiodescription démarre automatiquement.
          </p>

          {/* Cadre de visée */}
          <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden bg-slate-900 border-4 border-slate-800 shadow-2xl mx-auto">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
              aria-label="Flux caméra pour scanner le QR code"
            />
            <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

            {status === 'scanning' && (
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-8 rounded-2xl border-2 border-primary-500/60" />
              </div>
            )}

            {status !== 'scanning' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6" aria-hidden="true">
                <CameraOff size={48} className="text-slate-600" />
                <p className="text-sm text-slate-500">Caméra inactive</p>
              </div>
            )}
          </div>

          {/* Boutons caméra */}
          <div className="mt-6 w-full space-y-4">
            {status !== 'scanning' && (
              <button
                onClick={startCamera}
                className="w-full px-8 py-4 bg-slate-900 border border-slate-700 hover:border-primary-500 text-white rounded-2xl font-bold text-lg transition-all active:scale-95 accessible-focus inline-flex items-center justify-center gap-3"
                aria-label="Activer la caméra pour scanner le QR code"
              >
                <Camera size={22} aria-hidden="true" />
                Activer la caméra
              </button>
            )}

            {status === 'scanning' && (
              <button
                onClick={() => { stopCamera(); setStatus('idle'); setLiveMessage('Caméra arrêtée.'); }}
                className="w-full px-8 py-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl font-bold transition-all accessible-focus"
                aria-label="Arrêter la caméra"
              >
                Arrêter la caméra
              </button>
            )}
          </div>
        </section>

        {/* ── Région d'annonces lecteur d'écran (affichée aussi à l'écran) ── */}
        <p
          role="status"
          aria-live="polite"
          className="mt-8 min-h-[1.5rem] text-sm text-slate-400"
        >
          {liveMessage}
        </p>

        {error && (
          <p role="alert" className="mt-2 text-amber-400 font-medium text-sm">
            {error}
          </p>
        )}

        <Link
          href="/gallery"
          className="mt-6 text-slate-400 hover:text-white font-medium transition-colors underline underline-offset-4"
        >
          Ou choisir une œuvre dans la galerie
        </Link>
      </div>

      <footer className="mt-16 py-8 text-center border-t border-white/5 opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">
          L'audiodescription commence dès l'ouverture de l'œuvre
        </p>
      </footer>
    </main>
  );
}