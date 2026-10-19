// lib/ai.ts — Sélection du fournisseur IA selon la config du club.
// "gemini" (défaut) ou "mistral". Le prompt (lib/prompt.ts) est commun.
// v2 (17/10) : JSON réparé + VALIDATION de la structure — Pixtral (Mistral)
// est moins discipliné que Gemini : JSON sans "titles" (→ crash .map dans
// l'interface) ou avec retours à la ligne bruts dans les chaînes
// (→ "Bad control character in string literal").
import { IA_PROMPT } from "@/lib/prompt";

// Échappe les caractères de contrôle bruts (sauts de ligne, tabulations)
// à l'intérieur des chaînes du JSON — interdits en JSON strict mais
// renvoyés parfois par Mistral.
function repairJson(raw: string): string {
  return raw.replace(/"(?:[^"\\]|\\.)*"/g, (match) =>
    match.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, (c) => {
      if (c === '\n') return '\\n';
      if (c === '\r') return '\\r';
      if (c === '\t') return '\\t';
      return '';
    })
  );
}

// v3 (17/10 soir) : après l'échec de la v2 (« structure invalide »), on ajoute
// (a) le retrait des virgules traînantes, (b) le LOG du JSON brut dans les logs
// du conteneur au moment de l'échec — pour lire la vraie malformation de
// Pixtral via `docker compose logs app-atoutsud` et la corriger précisément.
function extractJson(text: string) {
  // Retire d'éventuelles barrières markdown ```json ... ```
  const cleaned = text.replace(/```(?:json)?/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("L'IA n'a pas renvoyé de format JSON valide.");
  }
  const raw = jsonMatch[0];
  try {
    return JSON.parse(raw);
  } catch {
    // 2e tentative : réparation des caractères de contrôle bruts
    try {
      return JSON.parse(repairJson(raw));
    } catch {
      // 3e tentative : virgules traînantes avant } ou ]
      const noTrailing = repairJson(raw).replace(/,\s*([}\]])/g, '$1');
      try {
        return JSON.parse(noTrailing);
      } catch {
        // ÉCHEC : on log le JSON brut pour diagnostic (à lire dans
        // `docker compose logs app-atoutsud`) avant d'abandonner.
        console.error('[IA] JSON illisible — contenu brut renvoyé par le modèle :\n' + raw);
        throw new Error("L'IA a renvoyé un JSON illisible (structure invalide). Relancez l'analyse.");
      }
    }
  }
}

// Valide la structure attendue par l'interface (titres + 3 textes).
// Évite le crash "Cannot read properties of undefined (reading 'map')"
// quand l'IA omet une clé.
function validateProposal(data: any) {
  if (
    !data ||
    !Array.isArray(data.titles) ||
    data.titles.length === 0 ||
    !data.titles.every((t: any) => typeof t === 'string' && t.trim()) ||
    !data.description ||
    typeof data.description.overview !== 'string' ||
    typeof data.description.details !== 'string' ||
    typeof data.description.atmosphere !== 'string'
  ) {
    throw new Error("L'IA n'a pas respecté le format attendu (titres ou textes manquants). Relancez l'analyse.");
  }
  return data;
}

// ---------- Gemini (code existant, déplacé) ----------
async function describeWithGemini(imageBase64: string) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Clé API Gemini non configurée.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    IA_PROMPT,
    { inlineData: { data: imageBase64, mimeType: "image/jpeg" } },
  ]);
  const text = (await result.response).text();
  return validateProposal(extractJson(text));
}

// ---------- Mistral (Pixtral, vision) ----------
async function describeWithMistral(imageBase64: string) {
  const apiKey = process.env.MISTRAL_API_KEY || "";
  if (!apiKey) throw new Error("Clé API Mistral non configurée.");

  const model = process.env.MISTRAL_MODEL || "pixtral-12b-2409";

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: IA_PROMPT + "\n\nIMPORTANT : réponds UNIQUEMENT par l'objet JSON demandé, sans texte autour, sans markdown, et sans retours à la ligne à l'intérieur des chaînes de caractères." },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur Mistral (${res.status}) : ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content || "";
  return validateProposal(extractJson(text));
}

// ---------- Point d'entrée unique ----------
export async function describeImage(imageBase64: string) {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  try {
    if (provider === "mistral") {
      return await describeWithMistral(imageBase64);
    }
    return await describeWithGemini(imageBase64);
  } catch (err: any) {
    console.error(`Erreur IA (${provider}):`, err.message);
    throw err;
  }
}