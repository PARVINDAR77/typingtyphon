/**
 * Resolves the backend NestJS API base URL reliably across:
 * - Localhost development (http://localhost:4001/api/v1)
 * - Raw Docker port 3100 browsing (http://<server-ip>:4001/api/v1)
 * - Custom domain or reverse proxy deployments (via standard origin /api/v1 or NEXT_PUBLIC_API_URL)
 */
export function getApiBaseUrl(): string {
  // 1. If explicit NEXT_PUBLIC_API_URL is configured and not pointing to outdated port 4005
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes(':4005')) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }

  // 2. Client-side dynamic resolution based on active window location
  if (typeof window !== 'undefined') {
    const { protocol, host, hostname, port } = window.location;

    // If directly accessing via raw development/container port 3100, connect to 4001
    if (port === '3100') {
      return `${protocol}//${hostname}:4001/api/v1`;
    }

    // If running on a live domain or reverse proxy (e.g. typingtyphon.emperorsmartsolutions.com)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Connect through Nginx reverse proxy on the same origin
      return `${protocol}//${host}/api/v1`;
    }
  }

  // 3. Default fallback for local dev
  return 'http://localhost:4001/api/v1';
}
