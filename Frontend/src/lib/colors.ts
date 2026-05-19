// Static Tailwind class maps. Tailwind's JIT scanner picks up literal class strings
// from this file, so consumers can use a dynamic key (e.g. 'indigo') without losing the
// generated CSS. Replaces the brittle `bg-accent-${color}` template-literal pattern.

export type AccentKey = 'blue' | 'purple' | 'green' | 'sky' | 'teal' | 'indigo' | 'brand';

export const ACCENT_BG: Record<AccentKey, string> = {
  blue: 'bg-accent-blue',
  purple: 'bg-accent-purple',
  green: 'bg-accent-green',
  sky: 'bg-accent-sky',
  teal: 'bg-accent-teal',
  indigo: 'bg-accent-indigo',
  brand: 'bg-accent-brand',
};

export const ACCENT_TEXT: Record<AccentKey, string> = {
  blue: 'text-accent-blue',
  purple: 'text-accent-purple',
  green: 'text-accent-green',
  sky: 'text-accent-sky',
  teal: 'text-accent-teal',
  indigo: 'text-accent-indigo',
  brand: 'text-accent-brand',
};

export const STAT_BG: Record<string, string> = {
  views: 'bg-stat-views',
  visits: 'bg-stat-visits',
  newUsers: 'bg-stat-newUsers',
  activeUsers: 'bg-stat-activeUsers',
};

// Raw hex values — for libraries (ECharts, canvas, etc.) that don't speak Tailwind classes.
// Keep these in sync with tailwind.config.js `colors.accent`.
export const ACCENT_HEX: Record<AccentKey, string> = {
  blue: '#A8C5DA',
  purple: '#C6C7F8',
  green: '#BAEDBD',
  sky: '#B1E3FF',
  teal: '#A1E3CB',
  indigo: '#95A4FC',
  brand: '#7094F4',
};

const ACCENT_FALLBACK: AccentKey = 'brand';

export function accentBg(color: string): string {
  return ACCENT_BG[color as AccentKey] ?? ACCENT_BG[ACCENT_FALLBACK];
}

export function accentText(color: string): string {
  return ACCENT_TEXT[color as AccentKey] ?? ACCENT_TEXT[ACCENT_FALLBACK];
}

export function accentHex(color: string): string {
  return ACCENT_HEX[color as AccentKey] ?? ACCENT_HEX[ACCENT_FALLBACK];
}

export function statBg(key: string): string {
  return STAT_BG[key] ?? STAT_BG.views;
}
