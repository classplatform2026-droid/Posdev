function getDefaultApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location?.origin;
  return origin && origin !== 'null' ? origin : '';
}

// Prefer explicit deployment URL; otherwise use the current frontend origin so same-origin
// deployments work without extra environment config.
const API_BASE_URL = formatBaseUrl(
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL)
    : getDefaultApiBaseUrl()
);
