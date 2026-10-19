'use server';

import { describeImage } from "@/lib/ai";

/**
 * Analyse une image via l'IA configurée pour CE club (AI_PROVIDER :
 * "gemini" ou "mistral"). Reçoit la chaîne base64 de l'image.
 */
export async function analyzePhotoAction(imageBase64: string) {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  try {
    const key = provider === "mistral" ? process.env.MISTRAL_API_KEY : process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        `Clé API ${provider === "mistral" ? "Mistral" : "Gemini"} manquante dans la configuration du club (AI_PROVIDER=${provider}).`
      );
    }

    const data = await describeImage(imageBase64);
    return { success: true, data };
  } catch (error: any) {
    const debugKey =
      (provider === "mistral" ? process.env.MISTRAL_API_KEY : process.env.GEMINI_API_KEY) || "";
    const msg = `L'analyse a échoué (IA: ${provider}, Clé détectée: Lg ${debugKey.trim().length}). Erreur: ${error.message}`;
    return { success: false, error: msg };
  }
}