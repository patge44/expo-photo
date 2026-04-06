'use server';

import { describeImage } from '@/lib/gemini';

/**
 * Analyse une image via Gemini Vision 1.5 Flash (Côté Serveur).
 * Reçoit la chaîne base64 de l'image.
 */
export async function analyzePhotoAction(imageBase64: string) {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      throw new Error("Clé API Gemini manquante dans .env.local");
    }

    const data = await describeImage(imageBase64);
    return { success: true, data };
  } catch (error: any) {
    // On importe la fonction de diagnostic pour voir ce qui se passe réellement au coeur de l'action
    const debugKey = process.env.GEMINI_API_KEY || "";
    const msg = `L'analyse a échoué (Clé détectée: Lg ${debugKey.trim().length}). Erreur: ${error.message}`;
    return { success: false, error: msg };
  }
}
