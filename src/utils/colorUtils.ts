// Color utilities
// Converts base hex color (#RRGGBB or #RGB) to 8-digit hex with alpha (#RRGGBBAA)
export function addOpacity(hexColor: string, opacity: number): string {
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const alpha = Math.round(clamp01(opacity) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  const clean = (hexColor || '#000').replace('#', '');
  const short = clean.length === 3;
  const base = short
    ? clean
        .split('')
        .map((c) => c + c)
        .join('')
        .slice(0, 6)
    : clean.slice(0, 6);
  return `#${base}${alpha}`;
}

// Adjusts brightness by percent (-100..100). Positive to lighten, negative to darken.
export function adjustColorBrightness(hexColor: string, percent: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const clean = (hexColor || '#000000').replace('#', '').slice(0, 6);
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const factor = 1 + percent / 100;
  const nr = clamp(Math.round(r * factor));
  const ng = clamp(Math.round(g * factor));
  const nb = clamp(Math.round(b * factor));
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`.toUpperCase();
}
