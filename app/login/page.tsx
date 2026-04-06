'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { siteConfig } from '@/lib/config';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pour cet outil de gestion simple, on stocke un cookie d'autorisation 
    // qui sera vérifié par le middleware.
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        setError('Mot de passe incorrect.');
      }
    } catch (err) {
      setError('Erreur de connexion.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.1),transparent)] pointer-events-none" />
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl z-10">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={32} />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Espace Club Photo</h1>
        <p className="text-slate-500 text-center mb-8 text-sm">Entrez le mot de passe du club pour accéder à l'administration.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-primary-500/20"
          >
            Se Connecter <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
      
      <footer className="absolute bottom-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} {siteConfig.clubName}
      </footer>
    </main>
  );
}
