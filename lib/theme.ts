// lib/theme.ts — Génère la palette primary (10 nuances) à partir d'une
// couleur de base hexadécimale saisie dans le .env (PRIMARY_COLOR).

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
  if (!m) throw new Error(`Couleur invalide : ${hex} (format attendu #rrggbb)`);
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgbTriplet(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  const hh = (h % 360 + 360) % 360;
  if (hh < 60) { r = c; g = x; }
  else if (hh < 120) { r = x; g = c; }
  else if (hh < 180) { g = c; b = x; }
  else if (hh < 240) { g = x; b = c; }
  else if (hh < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);
  return `${R} ${G} ${B}`;
}

// Nuances en % de luminosité, calquées sur la palette bleu ciel de Tailwind.
const SHADES: [string, number][] = [
  ['50', 97], ['100', 94], ['200', 86], ['300', 77], ['400', 69],
  ['500', 60], ['600', 51], ['700', 42], ['800', 35], ['900', 29], ['950', 20],
];

// Retourne un bloc CSS `--c-primary-XXX: r g b; ...` pour la couleur donnée.
export function primaryCssVars(primaryColor?: string): string {
  if (!primaryColor) return ''; // pas de couleur configurée → on garde les défauts
  const { h, s } = hexToHsl(primaryColor.trim());
  return SHADES.map(([name, l]) => `--c-primary-${name}: ${hslToRgbTriplet(h, s, l)};`).join('\n    ');
}