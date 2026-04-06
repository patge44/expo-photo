'use client';

import { useState } from 'react';
import { checkGeminiConfig } from '../actions/debug';

export default function DebugPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    const result = await checkGeminiConfig();
    setData((prev: any) => ({ ...prev, ...result }));
    setLoading(false);
  };

  const runApiTest = async () => {
    setLoading(true);
    const res = await fetch('/api/debug');
    const result = await res.json();
    setData((prev: any) => ({ ...prev, apiResult: result }));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Diagnostic Gemini API</h1>
        
        <div className="flex gap-4">
          <button 
            onClick={runTest}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? '...' : 'Diagnostic Server Action'}
          </button>

          <button 
            onClick={runApiTest}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-semibold"
          >
            {loading ? '...' : 'Test API Route (Direct)'}
          </button>
        </div>

        {data && (
          <div className="space-y-4">
            {data.apiResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="font-bold text-emerald-800">Résultat API Route (GET) :</p>
                <code className="block mt-2 text-sm bg-white p-2 rounded border font-mono whitespace-pre-wrap">
                  {JSON.stringify(data.apiResult, null, 2)}
                </code>
              </div>
            )}
            <div className="p-4 bg-white rounded-xl shadow-sm border">
               <p className="font-semibold">Clé détectée : <span className="text-blue-600 font-mono">{data.maskedKey || "AUCUNE"}</span></p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {data.results?.map((res: any, i: number) => (
                <div key={i} className={`p-4 rounded-xl border ${res.status === 200 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase">{res.name}</span>
                    <span className={`px-2 py-1 rounded text-sm font-bold ${res.status === 200 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {res.status} {res.text}
                    </span>
                  </div>
                  {res.error && <p className="mt-2 text-sm text-red-600 font-mono">{res.error}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
