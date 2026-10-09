'use client';

import { useEffect, useState } from 'react';
import { deleteArtworkAction, updateArtworkAction } from '@/app/actions/db';
import { downloadCartelJPEG } from '@/lib/cartel';
import { Loader2, Trash2, ArrowLeft, Image as ImageIcon, Search, Edit3, Save, X, Presentation } from 'lucide-react';
import Link from 'next/link';

interface Artwork {
  id: string;
  title: string;
  author: string;
  photo_number: string;
  image_url: string;
  created_at: string;
  description_overview: string;
  description_details: string;
  description_atmosphere: string;
}

export default function ManagePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // État de l'édition
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Artwork>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchArtworks();
  }, []);

  async function fetchArtworks() {
    setLoading(true);
    try {
      const res = await fetch('/api/artworks?all=1');
      if (res.ok) {
        setArtworks(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette image ? Pensez à vérifier qu'elle n'est plus exposée physiquement.")) {
      return;
    }

    setDeletingId(id);
    const result = await deleteArtworkAction(id, imageUrl);
    if (result.success) {
      setArtworks(artworks.filter(a => a.id !== id));
    } else {
      alert("Erreur lors de la suppression : " + result.error);
    }
    setDeletingId(null);
  };

  const startEditing = (artwork: Artwork) => {
    setEditingId(artwork.id);
    setEditForm({ ...artwork });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setIsSaving(true);
    
    const result = await updateArtworkAction(editingId, {
      title: editForm.title || '',
      photo_number: editForm.photo_number || '',
      description_overview: editForm.description_overview || '',
      description_details: editForm.description_details || '',
      description_atmosphere: editForm.description_atmosphere || '',
    });

    if (result.success) {
      setArtworks(artworks.map(a => a.id === editingId ? { ...a, ...editForm } as Artwork : a));
      setEditingId(null);
    } else {
      alert("Erreur lors de la mise à jour : " + result.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bibliothèque</h1>
              <p className="text-slate-500">Gérez, éditez ou téléchargez chaque Cartel JPEG 17x4.</p>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary-500" size={40} />
            </div>
          ) : artworks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
              <Search size={48} className="opacity-20" />
              <p>Aucune photo dans la bibliothèque.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                    <th className="p-4 font-medium uppercase tracking-wider w-24">Aperçu</th>
                    <th className="p-4 font-medium uppercase tracking-wider w-20">N°</th>
                    <th className="p-4 font-medium uppercase tracking-wider">Titre / Description</th>
                    <th className="p-4 font-medium uppercase tracking-wider text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {artworks.map((artwork) => (
                    <tr key={artwork.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="p-4 align-top">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                          <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      
                      <td className="p-4 align-top font-black text-slate-400">
                        {editingId === artwork.id ? (
                          <input 
                            type="text" 
                            className="w-16 px-2 py-1 border rounded bg-white text-slate-900 font-bold" 
                            value={editForm.photo_number || ''} 
                            onChange={e => setEditForm({...editForm, photo_number: e.target.value})}
                          />
                        ) : (
                          artwork.photo_number || '--'
                        )}
                      </td>

                      <td className="p-4 align-top">
                        {editingId === artwork.id ? (
                          <div className="space-y-3 pr-4">
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-medium" 
                              value={editForm.title || ''} 
                              onChange={e => setEditForm({...editForm, title: e.target.value})}
                            />
                            <textarea 
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-sm h-20" 
                              placeholder="Résumé global..."
                              value={editForm.description_overview || ''} 
                              onChange={e => setEditForm({...editForm, description_overview: e.target.value})}
                            />
                            <textarea 
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-sm h-32" 
                              placeholder="Détails..."
                              value={editForm.description_details || ''} 
                              onChange={e => setEditForm({...editForm, description_details: e.target.value})}
                            />
                            <textarea 
                              className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-sm h-20" 
                              placeholder="Ambiance..."
                              value={editForm.description_atmosphere || ''} 
                              onChange={e => setEditForm({...editForm, description_atmosphere: e.target.value})}
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-lg mb-1">{artwork.title}</p>
                            <p className="text-slate-500 text-sm line-clamp-2 italic">"{artwork.description_overview}"</p>
                          </div>
                        )}
                      </td>

                      <td className="p-4 align-top text-right">
                        {editingId === artwork.id ? (
                          <div className="flex flex-col gap-2 items-end">
                            <button onClick={saveEdit} disabled={isSaving} className="p-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">
                              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-2 text-slate-500 bg-slate-200 rounded-lg hover:bg-slate-300 transition">
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 items-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => downloadCartelJPEG(artwork)} className="p-2 px-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition font-bold" title="Télécharger le Cartel Format A4/Bandeau">
                              <Presentation size={18} />
                            </button>
                            <button onClick={() => startEditing(artwork)} className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition" title="Éditer les textes">
                              <Edit3 size={18} />
                            </button>
                            <button onClick={() => handleDelete(artwork.id, artwork.image_url)} disabled={deletingId === artwork.id} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/50 rounded-lg transition" title="Supprimer">
                              {deletingId === artwork.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
