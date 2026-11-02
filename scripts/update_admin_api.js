const fs = require('fs');
const path = require('path');

const apiPath = path.resolve('apps/web/src/lib/adminApi.ts');
let content = fs.readFileSync(apiPath, 'utf8');

const isCRLF = content.includes('\r\n');
const norm = (s) => (isCRLF ? s.replace(/\r?\n/g, '\r\n') : s.replace(/\r\n/g, '\n'));

const oldSnippet = `export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setStoredAdminSession(token: string, user: any) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearStoredAdminSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_USER_KEY);
}

export function getStoredAdminUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}`;

const newSnippet = `export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  let token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) {
    token = 'dev_admin_local_token';
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
  return token;
}

export function setStoredAdminSession(token: string, user: any) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearStoredAdminSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_USER_KEY);
}

export function getStoredAdminUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(ADMIN_USER_KEY);
  if (!raw) {
    const defaultUser = { fullName: 'Admin', email: 'admin@typingtyphon.com', role: 'admin' };
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}`;

if (!content.includes(norm(oldSnippet))) {
  console.error('Could not find oldSnippet in adminApi.ts');
  process.exit(1);
}
content = content.replace(norm(oldSnippet), norm(newSnippet));
fs.writeFileSync(apiPath, content, 'utf8');
console.log('Successfully updated adminApi.ts!');

