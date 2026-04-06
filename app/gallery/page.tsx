'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Headphones, ArrowRight, Camera, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';

interface Artwork {
  id: string;
  title: string;
  photo_number?: string;
  image_url: string;
}

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtworks() {
      const { data, error } = await supabase
        .from('artworks')
        .select('id, title, photo_number, image_url')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setArtworks(data);
      }
      setLoading(false);
    }
    fetchArtworks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-widest mb-2">
              <Camera size={16} />
              <span>{siteConfig.exhibitionName}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">Galerie Numérique</h1>
          </div>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold shadow-sm hover:shadow-md transition-all"
          >
            <Sparkles size={18} className="text-amber-500" />
            Espace Admin
          </Link>
        </header>

        {artworks.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 mb-4 text-lg">Aucune œuvre n'a encore été publiée.</p>
            <Link href="/admin" className="text-primary-600 font-bold hover:underline">
              Commencer par ajouter une photo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map((artwork, idx) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.title}
                    className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-6 group-hover:text-primary-600 transition-colors tracking-tight">
                    {artwork.photo_number && <span className="text-primary-500 mr-2">{artwork.photo_number} -</span>}
                    {artwork.title}
                  </h3>
                  
                  <Link 
                    href={`/audio/${artwork.id}`}
                    className="flex items-center justify-between w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-primary-600 hover:text-white rounded-2xl font-bold transition-all text-sm group/btn"
                  >
                    <span className="flex items-center gap-2">
                      <Headphones size={18} />
                      Écouter l'œuvre
                    </span>
                    <ArrowRight size={18} className="transform group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <footer className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 text-sm">
          <Link href="/" className="hover:text-primary-600 transition-colors">Retour à l'accueil</Link>
          <span className="mx-4">|</span>
          <span>© {new Date().getFullYear()} {siteConfig.clubName}</span>
        </footer>
      </div>
    </main>
  );
}
