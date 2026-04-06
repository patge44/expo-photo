'use server';

export async function checkGeminiConfig() {
  // Version ultra-propre de l'extraction de clé
  let apiKey = (process.env.GEMINI_API_KEY || "").replace(/\s/g, '').replace(/["']/g, '');
  
  const keyLength = apiKey.length;
  const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)} (Lg: ${keyLength})`;

  if (keyLength < 10) {
    return { success: false, env: "Clé trop courte ou absente", details: `Longueur détectée: ${keyLength}` };
  }

  const tests = [
    { name: "v1-flash", url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}` },
    { name: "v1-flash-8b", url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}` },
    { name: "v1beta-flash", url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}` },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const res = await fetch(test.url, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] }),
        cache: 'no-store', // Désactive le cache Next.js qui peut corrompre l'URL
      });
      const data = await res.json().catch(() => ({}));
      results.push({
        name: test.name,
        status: res.status,
        text: res.statusText,
        error: data.error?.message || null
      });
    } catch (err: any) {
      results.push({ name: test.name, status: "ERROR", error: err.message });
    }
  }

  return { success: true, maskedKey, results };
}
