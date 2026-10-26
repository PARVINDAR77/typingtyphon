/**
 * Resolves the backend NestJS API base URL reliably across:
 * - Localhost development (http://localhost:4001/api/v1)
 * - Live VPS direct IP (http://<server-ip>:4001/api/v1)
 * - Custom domain or reverse proxy deployments (via NEXT_PUBLIC_API_URL)
 */
export function getApiBaseUrl(): string {
  // 1. If explicit NEXT_PUBLIC_API_URL is configured and not pointing to outdated port 4005
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes(':4005')) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }

  // 2. Client-side dynamic resolution based on active window hostname
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    // If running on live IP or domain, automatically connect to port 4001 on the same host
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:4001/api/v1`;
    }
  }

  // 3. Default fallback for local dev
  return 'http://localhost:4001/api/v1';
}
