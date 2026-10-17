export const siteConfig = {
  clubName: process.env.CLUB_NAME || "PHOTOCLUB des Sorinières",
  exhibitionName: process.env.EXHIBITION_NAME || "De la note à l'image",
  introText:
    process.env.INTRO_TEXT ||
    "Vivez la photographie au-delà du regard : chaque image est décrite par l'audiodescription pour les personnes malvoyantes.",
  // 10A — couleur principale du club (#rrggbb) — vide = bleu ciel par défaut.
  primaryColor: process.env.PRIMARY_COLOR || "",
  // 10A — logo du club : URL servie par l'app (voir route /api/logo).
  logoUrl: process.env.CLUB_LOGO === "1" ? "/api/logo" : "",
  // 10B — fournisseur IA du club : "gemini" (défaut) ou "mistral".
  aiProvider: process.env.AI_PROVIDER || "gemini",
  // 10C — dimensions des cartels en cm.
  cartelWidthCm: Number(process.env.CARTEL_WIDTH_CM) || 17,
  cartelHeightCm: Number(process.env.CARTEL_HEIGHT_CM) || 4,
};