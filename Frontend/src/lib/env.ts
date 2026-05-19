function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

// Strip any trailing slash so consumers can safely concatenate `${env.apiUrl}/path`.
// Axios normalises `//` but raw fetch (used for CSV export) does not — without this,
// a value like `https://api.example.com/api/` would produce `/api//leads/...` and 404.
function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export const env = {
  apiUrl: normalizeBaseUrl(required('VITE_API_URL', import.meta.env.VITE_API_URL)),
  mode: import.meta.env.MODE as 'development' | 'production' | 'test',
} as const;
