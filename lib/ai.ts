// lib/ai.ts — Sélection du fournisseur IA selon la config du club.
// "gemini" (défaut) ou "mistral". Le prompt (lib/prompt.ts) est commun.
import { IA_PROMPT } from "@/lib/prompt";

function extractJson(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("L'IA n'a pas renvoyé de format JSON valide.");
  }
  return JSON.parse(jsonMatch[0]);
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
  return extractJson(text);
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
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: IA_PROMPT },
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
  return extractJson(text);
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