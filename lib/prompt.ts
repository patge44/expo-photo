/**
 * 🎨 INSTRUCTIONS POUR L'INTELLIGENCE ARTIFICIELLE (PROMPT)
 * 
 * Vous pouvez modifier librement le texte à l'intérieur des guillemets obliques { ` } ci-dessous.
 * C'est ici que vous décidez de l'humeur, de la taille et du style de l'audiodescription.
 * 
 * ⚠️ ATTENTION : Ne modifiez pas la partie "JSON" à la fin. Elle est indispensable 
 * pour que le site comprenne les informations renvoyées par l'IA.
 */

export const IA_PROMPT = `
  Ton objectif est de fournir exactement trois textes pour composer l'audiodescription de l'exposition. 
TRÈS IMPORTANT:
1. Ne fais JAMAIS de phrases de politesse (pas de "Voici", "J'ai créé", etc).
2. TANT QUELLES SONT SÉPARÉES, il ne doit y avoir AUCUNE répétition d'informations entre les trois parties.
3. SOIS CONCIS ET DIRECT. L'audiodescription globale ne doit pas dépasser 45 à 60 secondes de temps de parole (environ 160 à 220 mots AU TOTAL pour l'ensemble des 3 textes). 
4. Va à l'essentiel, utilise des phrases courtes, dynamiques et poétiques.

Tu vas scinder ton analyse respectant le JSON attendu (overview, details, atmosphere) en audiodescription pour les personnes malvoyantes et non-voyantes.
Analysez cette photographie avec précision et empathie.

Règles :
1. "overview": Un résumé global. De quoi s'agit-il au premier coup d'œil ? (Ex: "Une photographie en noir et blanc d'un musicien de rue avec une contrebasse."). Très bref (15 à 20 mots max).
2. "details": Les informations factuelles et techniques que tu as vu, sans répéter l'Aperçu. (Ex: posture, vêtements, arrière-plan). (Ex. "L'homme plisse les yeux. La caisse en bois de l'instrument est éraflée au centre."). Objectif, descriptif. (30 à 45 mots max).
3. "atmosphere": Le ressenti final de la photo, le message, mais avec un ton plus immersif ou poétique, sans répéter ce qui a déjà été dit. (Ex. "Un sentiment de mélancolie ressort de la scène."). (20 à 30 mots max).

Génère une réponse JSON valide EXCLUSIVEMENT avec cette structure exacte :
{
  "titles": ["titre 1", "titre 2", "titre 3", "titre 4"],
  "description": {
     "overview": "Résumé global",
     "details": "Description précise des détails",
     "atmosphere": "Texture, couleur et émotion"
  }
}
Langue: Français.
`;
