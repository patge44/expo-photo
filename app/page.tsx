'use client';

import { motion } from 'framer-motion';
import { Camera, AudioLines, QrCode, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.15),transparent)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium text-sm mb-8 hover:bg-primary-200 transition-colors">
          <HeartHandshake size={16} />
          <span>Une exposition accessible pour tous</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
          Éclats de Vue
        </h1>
        
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Vivez la photographie au-delà du regard. Une expérience immersive de {siteConfig.clubName} où l’audiodescription donne vie aux images pour les personnes malvoyantes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FeatureCard 
            icon={<Camera className="text-primary-500" />}
            title="Photographie"
            description={`Les œuvres de l'${siteConfig.exhibitionName}.`}
          />
          <FeatureCard 
            icon={<AudioLines className="text-indigo-500" />}
            title="Audiodescription"
            description="Une narration riche pour décrire chaque cliché."
          />
          <FeatureCard 
            icon={<QrCode className="text-emerald-500" />}
            title="Accès QR"
            description="Le visiteur scanne, écoute et ressent l'image."
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/admin" 
            className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
          >
            Espace Club (Admin)
          </Link>
          <Link 
            href="/gallery" 
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-lg shadow-md transition-all hover:scale-105 active:scale-95"
          >
            Voir la Galerie
          </Link>
        </div>
      </motion.div>
      
      <footer className="absolute bottom-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} {siteConfig.clubName}. Fièrement inclusif.
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm cursor-default">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm">{description}</p>
    </div>
  );
}
