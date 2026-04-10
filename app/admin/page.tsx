'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, Loader2, Sparkles, Image as ImageIcon, PartyPopper, ArrowLeft } from 'lucide-react';
import { analyzePhotoAction } from '@/app/actions/ai';
import { saveArtworkAction } from '@/app/actions/db';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import QRCode from 'qrcode';
import { siteConfig } from '@/lib/config';

interface AIProposal {
  titles: string[];
  description: {
    overview: string;
    details: string;
    atmosphere: string;
  };
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'saved'>('idle');
  const [proposal, setProposal] = useState<AIProposal | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [customTitle, setCustomTitle] = useState<string>("");
  const [photoNumber, setPhotoNumber] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result?.toString();
        if (base64) resolve(base64);
        else reject(new Error("Échec de conversion de l'image."));
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Fichier trop volumineux. Veuillez compresser votre image sous 5 Mo.");
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus('idle');
      setProposal(null);
      setError(null);
      setSelectedTitle("");
      setCustomTitle("");
      setPhotoNumber("");
      setQrUrl("");
    }
  };

  const handleAnalysis = async () => {
    if (!file) return;
    setStatus('analyzing');
    setError(null);

    try {
      const base64Full = await fileToBase64(file);
      const base64Data = base64Full.split(',')[1];
      const result = await analyzePhotoAction(base64Data);
      
      if (result.success && result.data) {
        setProposal(result.data);
        setSelectedTitle(result.data.titles[0]);
        setStatus('done');
      } else {
        const errorStr = result.error?.toLowerCase() || "";
        if (errorStr.includes("429 too many requests") || errorStr.includes("quota")) {
          setError(`🚨 Limite de sécurité Google atteinte ! Vous avez dépassé le quota de requêtes gratuites par minute. Veuillez patienter une minute environ avant de pouvoir réutiliser l'Intelligence Artificielle.`);
        } else {
          setError(`[Erreur Système] : ${result.error || "Échec de l'analyse."}`);
        }
        setStatus('idle');
      }
    } catch (err: any) {
      setError(err.message || "Erreur de chargement de l'image.");
      setStatus('idle');
    }
  };

  const updateProposalField = (field: keyof AIProposal['description'], value: string) => {
    if (!proposal) return;
    setProposal({
      ...proposal,
      description: {
        ...proposal.description,
        [field]: value
      }
    });
  };

  const handleSave = async () => {
    if (!file || !proposal || (!selectedTitle && !customTitle)) return;
    setIsSaving(true);
    setError(null);

    try {
      const finalTitle = customTitle || selectedTitle;
      const base64Full = await fileToBase64(file);
      const result = await saveArtworkAction({
        title: finalTitle,
        author: siteConfig.clubName,
        photoNumber: photoNumber,
        imageData: base64Full,
        description: proposal.description
      });

      if (result.success && result.id) {
        // Génération du QR Code
        const artworkUrl = `${window.location.origin}/audio/${result.id}`;
        const qr = await QRCode.toDataURL(artworkUrl, {
          width: 300,
          margin: 2,
          color: { dark: '#020617', light: '#ffffff' }
        });
        setQrUrl(qr);
        
        setStatus('saved');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0ea5e9', '#6366f1', '#10b981']
        });
      } else {
        setError(result.error || "Échec de l'enregistrement. Vérifiez vos permissions Supabase.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'saved') {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Œuvre publiée !</h1>
          <p className="text-slate-500 mb-8 font-medium italic">"{customTitle || selectedTitle}"</p>
          
          {qrUrl && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl mb-8 inline-block mx-auto">
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mt-4">Scanner pour écouter</p>
              <a 
                href={qrUrl} 
                download={`QR_${(customTitle || selectedTitle).replace(/\s+/g, '_')}.png`}
                className="mt-4 inline-block text-xs font-bold text-primary-600 hover:underline"
              >
                Télécharger le QR Code
              </a>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => { setFile(null); setPreview(null); setStatus('idle'); setProposal(null); }}
              className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold transition-all hover:scale-105 shadow-lg shadow-primary-500/20"
            >
              Ajouter une autre photo
            </button>
            <Link href="/gallery" className="text-slate-500 font-medium hover:text-primary-600 transition-colors">
              Voir dans la galerie
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Espace Club Photo</h1>
              <p className="text-slate-700 dark:text-slate-300 font-medium">Gérez vos œuvres et préparez l'accessibilité</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/manage" className="px-4 py-2 border border-red-200 text-red-600 dark:border-red-900 dark:text-red-400 rounded-xl text-sm font-bold shadow-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              Gérer/Supprimer les photos
            </Link>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
              Admin
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Upload */}
          <section className="space-y-6">
            <div 
              className={`relative border-2 border-dashed rounded-3xl p-10 transition-all text-center
                ${preview ? 'border-primary-500 bg-primary-50/10' : 'border-slate-300 dark:border-slate-700 hover:border-primary-400'}`}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {!preview ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Upload className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Téléverser une photographie</p>
                    <p className="text-sm text-slate-400">JPEG, PNG jusqu'à 10MB</p>
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <img src={preview} alt="Aperçu" className="max-h-64 mx-auto rounded-xl shadow-lg mb-4" />
                  <p className="text-sm font-medium text-primary-600">Photo sélectionnée : {file?.name}</p>
                </motion.div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            {preview && status === 'idle' && (
              <button 
                onClick={handleAnalysis}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <Sparkles size={20} />
                Lancer l'analyse par IA
              </button>
            )}

            {status === 'analyzing' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl flex flex-col items-center gap-4 text-center">
                <Loader2 className="animate-spin text-primary-500" size={40} />
                <p className="font-medium">L'IA de qualité (Édition Flash) analyse votre photo...</p>
                <p className="text-sm text-slate-400 italic">Extraction des détails et construction du texte descriptif.</p>
              </div>
            )}
          </section>

          {/* Section Résultats */}
          <section className="space-y-6">
            <AnimatePresence mode="wait">
              {proposal ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <h2 className="text-xl font-bold">Propositions de l'IA (Modifiables)</h2>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-500 block mb-3">Titre de l'œuvre :</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {proposal.titles.map((title, i) => (
                        <button 
                          key={i} 
                          onClick={() => { setSelectedTitle(title); setCustomTitle(""); }}
                          className={`text-left px-4 py-3 border rounded-xl transition-all text-sm font-medium
                            ${selectedTitle === title && !customTitle
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                        >
                          {title}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="text" 
                      placeholder="Ou saisissez votre propre titre..."
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 mb-4 font-medium"
                    />

                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Numéro de la photo (Cartel) :</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 01, A4, etc."
                      value={photoNumber}
                      onChange={(e) => setPhotoNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 font-medium"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Ajustez le texte avant publication :</label>
                    <div className="p-1 space-y-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 block mb-1">Aperçu global</span>
                        <textarea 
                          className="w-full p-4 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl leading-relaxed italic resize-y min-h-[100px] focus:ring-2 focus:ring-primary-500"
                          value={proposal.description.overview}
                          onChange={(e) => updateProposalField('overview', e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 block mb-1">Détails de l'image</span>
                        <textarea 
                          className="w-full p-4 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl leading-relaxed resize-y min-h-[150px] focus:ring-2 focus:ring-primary-500"
                          value={proposal.description.details}
                          onChange={(e) => updateProposalField('details', e.target.value)}
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">Ambiance visuelle</span>
                        <textarea 
                          className="w-full p-4 text-sm font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl leading-relaxed resize-y min-h-[100px] focus:ring-2 focus:ring-primary-500"
                          value={proposal.description.atmosphere}
                          onChange={(e) => updateProposalField('atmosphere', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : <PartyPopper size={20} />}
                      {isSaving ? "Enregistrement..." : "Valider et Publier"}
                    </button>
                    <button 
                      disabled={isSaving}
                      onClick={() => { setProposal(null); setStatus('idle'); }}
                      className="px-6 py-4 border border-red-200 text-red-600 font-bold dark:border-red-900 dark:text-red-400 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors"
                    >
                      Refaire l'IA
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-6 p-8">
                  <ImageIcon size={64} className="text-slate-400 dark:text-slate-600 opacity-50" />
                  <div className="text-center">
                    <p className="font-bold text-slate-500 dark:text-slate-400">Analyse IA en attente</p>
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-2 max-w-xs mx-auto">Veuillez sélectionner une photo puis cliquer sur "Lancer l'analyse" dans le panneau de gauche.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </div>
  );
}

