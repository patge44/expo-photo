import { GoogleGenerativeAI } from "@google/generative-ai";
import { IA_PROMPT } from "@/lib/prompt";

function getApiKeyManually() {
  // En production (Vercel), on utilise directement process.env
  let apiKey = process.env.GEMINI_API_KEY || "";
  
  // En local, on peut tenter une lecture forcée si process.env échoue
  if (!apiKey && typeof window === 'undefined') {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/GEMINI_API_KEY=(.*)/);
        if (match && match[1]) apiKey = match[1];
      }
    } catch (e) {}
  }

  return apiKey.trim().replace(/[^a-zA-Z0-9\-_]/g, '');
}

export async function describeImage(imageBase64: string) {
  const apiKey = getApiKeyManually();
  
  if (!apiKey) {
    throw new Error("Clé API Gemini non configurée.");
  }

  // Utilisation de Gemini 2.5 Flash (le modèle identifié par diagnostic)
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });

  // Utilisation du prompt issu du fichier de configuration éditable
  const prompt = IA_PROMPT;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error("L'IA n'a pas renvoyé de format JSON valide.");
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (err: any) {
    console.error("Erreur SDK Gemini:", err.message);
    throw new Error(`Erreur Gemini: ${err.message}`);
  }
}
