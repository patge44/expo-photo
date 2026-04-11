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
2. TANT QU'ELLES SONT SÉPARÉES, il ne doit y avoir AUCUNE répétition d'informations entre les trois parties.
3. SOIS PRÉCIS ET FLUIDE. L'audiodescription globale doit comporter entre 110 et 140 mots AU TOTAL pour l'ensemble des 3 textes (pour durer entre 45 et 60 secondes d'écoute).
4. Ne sois pas télégraphique mais reste mesuré : choisis tes mots avec soin pour décrire de manière visuelle et poétique.

Tu vas scinder ton analyse respectant le JSON attendu (overview, details, atmosphere) en audiodescription pour les personnes malvoyantes et non-voyantes.
Analysez cette photographie avec une précision experte et de l'empathie.

Règles strictes de longueur :
1. "overview": Un résumé global. De quoi s'agit-il au premier coup d'œil ? Rédige exactement 1 à 2 phrases (environ 20 mots).
2. "details": Décris les informations factuelles et techniques (posture, vêtements, arrière-plan) sans répéter l'Aperçu. Rédige exactement 4 à 5 phrases claires et descriptives (environ 70 mots).
3. "atmosphere": Le ressenti final de la photo, le message, l'humeur, avec un ton immersif ou poétique. Rédige exactement 2 à 3 phrases (environ 30 mots).

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
