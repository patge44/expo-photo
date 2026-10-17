'use client';

import { motion } from 'framer-motion';
import { Camera, AudioLines, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useSiteConfig } from '@/components/site-config';

export default function Home() {
  const siteConfig = useSiteConfig();
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.15),transparent)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl z-10"
      >
        {/* Nom du club : ligne à part, hors du bloc d'intro */}
                {/* Logo du club (si configuré) + nom du club : ligne à part */}
        {siteConfig.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={siteConfig.logoUrl}
            alt={`Logo ${siteConfig.clubName}`}
            className="h-20 w-auto mx-auto mb-4"
          />
        )}
        <p className="text-sm font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-3">
          {siteConfig.clubName}
        </p>

        {/* Texte d'intro éditable par club via INTRO_TEXT (.env) */}
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
          {siteConfig.introText}
        </p>

        {/* Boutons visibles sans scroll */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/gallery"
            className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Voir la Galerie
          </Link>
          <Link
            href="/admin"
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg shadow-md transition-all hover:scale-105 active:scale-95"
          >
            Espace Club
          </Link>
        </div>

        {/* Blocs allégés : simples lignes texte, pas de cartes ni bordures */}
        <ul className="space-y-3 text-slate-600 dark:text-slate-400 text-sm">
          <li className="flex items-center justify-center gap-2">
            <Camera size={16} className="text-primary-500 shrink-0" />
            <span>Les photographies de l'exposition, présentées et numérotées.</span>
          </li>
          <li className="flex items-center justify-center gap-2">
            <AudioLines size={16} className="text-indigo-500 shrink-0" />
            <span>Une audiodescription pour chaque œuvre, pensée pour les malvoyants.</span>
          </li>
          <li className="flex items-center justify-center gap-2">
            <QrCode size={16} className="text-emerald-500 shrink-0" />
            <span>Scannez le QR code du cartel : la description se joue sur votre téléphone.</span>
          </li>
        </ul>
      </motion.div>

      <footer className="absolute bottom-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} {siteConfig.clubName}. Fièrement inclusif.
      </footer>
    </main>
  );
}