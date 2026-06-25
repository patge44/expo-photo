'use client';

import { useState, useRef, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, ArrowLeft, Headphones, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AudioPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [artwork, setArtwork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchArtwork() {
      try {
        const { data, error: dbError } = await supabase
          .from('artworks')
          .select('*')
          .eq('id', id)
          .single();

        if (dbError) throw dbError;
        setArtwork(data);
      } catch (err: any) {
        setError("L'œuvre est introuvable ou n'est plus disponible.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchArtwork();
  }, [id]);

  useEffect(() => {
    // Sync progress with speech synthesis for better visual feedback
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        // Simple linear estimation of progress as speechSynthesis doesn't give precise duration
        // We increment until 100% based on an average reading speed
        setProgress(prev => Math.min(prev + 0.5, 99));
      }, 500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (typeof window === 'undefined' || !artwork) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        // Construct the full text to read
        const fullText = `${artwork.title}. ${artwork.description_overview}. ${artwork.description_details}. ${artwork.description_atmosphere}`;

        // --- PATCH PHONÉTIQUE ---
        // Remplace les occurences du tissu "jean" par "djine" pour que la synthèse vocale française ne lise pas le prénom "Jean".
        let spokenText = fullText.replace(/ en jean/gi, " en djine")
          .replace(/ de jean/gi, " de djine")
          .replace(/ du jean/gi, " du djine")
          .replace(/ le jean/gi, " le djine")
          .replace(/ au jean/gi, " au djine");

        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('fr') && (v.name.includes('Google') || v.name.includes('Female'))) ||
          voices.find(v => v.lang.startsWith('fr'));

        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
          setIsPlaying(false);
          setProgress(100);
        };

        // Note: Suppression du cancel() ici car il cause des bugs sur iOS Safari
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setProgress(0);
      }
    }
  };

  const restart = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    setTimeout(() => {
      setIsPlaying(false);
      togglePlay();
    }, 500); // 500ms laisse le temps au buffer audio du navigateur de se vider proprement
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center text-pretty">
        <AlertCircle size={64} className="text-red-500 mb-6" />
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <Link href="/gallery" className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl font-bold text-slate-400 hover:text-white transition-colors">
          Retour à la galerie
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col p-6 overflow-x-hidden selection:bg-primary-500/30">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none" />

      <header className="flex items-center justify-between mb-8 z-10">
        <Link href={`/gallery`} className="p-3 rounded-full bg-slate-900 border border-slate-800 accessible-focus transition-transform active:scale-95 group" aria-label="Retour à la galerie">
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div className="flex items-center gap-2 text-primary-400 font-bold uppercase tracking-[0.2em] text-[10px]">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <span>Lecture immersive</span>
        </div>
        <div className="w-12 h-12" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full z-10">
        {/* Visualizer / Artwork Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-64 h-64 md:w-80 md:h-80 mb-12"
        >
          {/* Animated rings when playing */}
          <AnimatePresence>
            {isPlaying && [1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.8 }}
                className="absolute inset-0 rounded-full border-2 border-primary-500/20"
              />
            ))}
          </AnimatePresence>

          <div className="w-full h-full rounded-[2.5rem] bg-slate-900 border-4 border-slate-800 overflow-hidden shadow-2xl relative group">
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className={`w-full h-full object-cover transition-all duration-[2000ms] ease-out ${isPlaying ? 'scale-125 blur-[2px] brightness-50' : 'scale-100'}`}
            />
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [20, 60, 20] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2.5 bg-primary-500 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.6)]"
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-black mb-12 tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          {artwork.photo_number && <span className="text-primary-500 mr-3">{artwork.photo_number} -</span>}
          {artwork.title}
        </h1>

        {/* Player Controls */}
        <div className="w-full space-y-12">
          <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-600 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'linear', duration: 0.5 }}
            />
          </div>

          <div className="flex items-center justify-center gap-10">
            <button
              onClick={restart}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white accessible-focus transition-all hover:bg-slate-800 group"
              aria-label="Recommencer l'écoute"
            >
              <RotateCcw size={28} className="group-hover:rotate-[-90deg] transition-transform" />
            </button>

            <button
              onClick={togglePlay}
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all bg-white text-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 accessible-focus ring-offset-4 ring-offset-slate-950 ring-white/10 hover:ring-white/30 ring-2
                ${!isPlaying ? 'bg-primary-500 text-white border-none' : ''}`}
              aria-label={isPlaying ? "Mettre en pause" : "Lancer l'audiodescription"}
            >
              {isPlaying ? <Pause size={56} fill="currentColor" /> : <Play size={56} className="ml-2" fill="currentColor" />}
            </button>

            {/* Hidden placeholder to keep layout balanced */}
            <div className="w-16 md:w-20" />
          </div>
        </div>

        {/* Descriptive Text Card */}
        <div className="mt-20 space-y-10 text-left w-full border-t border-white/5 pt-16">
          <section className="relative">
            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary-500/20 rounded-full" />
            <h2 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
              Audiodescription guidée
            </h2>
            <div className="space-y-10">
              <p className="text-slate-200 leading-[1.8] text-lg font-medium italic">
                "{artwork.description_overview}"
              </p>

              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-[1.8] text-lg font-medium">
                  {artwork.description_details}
                </p>
              </div>

              <div className="p-8 bg-gradient-to-br from-primary-950/20 to-slate-900/50 border border-white/5 rounded-[2rem] shadow-inner relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Volume2 size={80} />
                </div>
                <span className="text-[10px] font-black uppercase text-primary-400 block mb-3 tracking-[0.4em]">Atmosphère & Texture</span>
                <p className="text-slate-400 leading-[1.8] text-lg font-medium">{artwork.description_atmosphere}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-32 py-12 text-center border-t border-white/5 opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">
          Exposition De la note à l’image• 2026 • Soutien par IA Inclusive
        </p>
      </footer>
    </main>
  );
}
