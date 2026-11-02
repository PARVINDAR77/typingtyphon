import { getApiBaseUrl } from './apiConfig';
import {
  AdminDashboardData,
  AdminUsersListResponseDto,
  AdminCurriculumStageDto,
  AdminPlatformHealth,
  AdminAuditLogItem,
  AdminReportData,
} from '@typingtyphon/contracts';

const ADMIN_TOKEN_KEY = 'tt_admin_token';
const ADMIN_USER_KEY = 'tt_admin_user';

export function getStoredAdminToken(): string | null {
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
}

/**
 * Deterministic number formatter that groups thousands with commas (e.g. 1,238,450)
 * independent of OS or browser locale (e.g. avoiding en-IN vs en-US SSR hydration mismatches).
 */
export function formatNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null) return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0';
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Deterministic UTC timestamp formatter avoiding timezone and locale hydration differences.
 */
export function formatDateDeterministic(isoDate: string | Date | undefined | null): string {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return String(isoDate);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min} UTC`;
}

async function adminFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const baseUrl = getApiBaseUrl();
  const token = getStoredAdminToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}/admin${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
      clearStoredAdminSession();
      window.location.href = '/admin/login?reason=session_expired';
    }
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const adminApi = {
  async login(email: string, password: string):Promise<{ success: boolean; user: any; accessToken: string }> {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Invalid administrator credentials');
    }

    if (data.accessToken && data.user) {
      setStoredAdminSession(data.accessToken, data.user);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/admin/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      clearStoredAdminSession();
    }
  },

  async getProfile(): Promise<any> {
    return adminFetch('/auth/me');
  },

  async getDashboard(period: string = '30d'): Promise<AdminDashboardData> {
    const res = await adminFetch(`/dashboard?period=${encodeURIComponent(period)}`);
    return res.data;
  },

  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}): Promise<AdminUsersListResponseDto> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.search) query.set('search', params.search);
    if (params.role && params.role !== 'All') query.set('role', params.role);
    if (params.status && params.status !== 'All') query.set('status', params.status);

    const res = await adminFetch(`/users?${query.toString()}`);
    return res.data;
  },

  async getUserDetail(id: string): Promise<any> {
    const res = await adminFetch(`/users/${encodeURIComponent(id)}`);
    return res.data;
  },

  async updateUserStatus(id: string, status: string, reason?: string): Promise<any> {
    return adminFetch(`/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  async getCurriculumStages(): Promise<AdminCurriculumStageDto[]> {
    const res = await adminFetch('/curriculum/stages');
    return res.data;
  },

  async updateLessonThreshold(lessonId: string, thresholds: { minAccuracyPct: number; minWpm: number }): Promise<any> {
    return adminFetch(`/curriculum/lessons/${encodeURIComponent(lessonId)}`, {
      method: 'PATCH',
      body: JSON.stringify(thresholds),
    });
  },

  async getReports(type: string = 'usage', dateRange: string = '30d'): Promise<AdminReportData> {
    const res = await adminFetch(`/reports?type=${encodeURIComponent(type)}&dateRange=${encodeURIComponent(dateRange)}`);
    return res.data;
  },

  async downloadReportsCsv(type: string = 'usage', dateRange: string = '30d'): Promise<void> {
    const baseUrl = getApiBaseUrl();
    const token = getStoredAdminToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(
      `${baseUrl}/admin/reports?type=${encodeURIComponent(type)}&dateRange=${encodeURIComponent(dateRange)}&exportFormat=csv`,
      {
        headers,
        credentials: 'include',
      },
    );

    if (!res.ok) {
      throw new Error('Failed to download CSV export');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typingtyphon-report-${type}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async getSystemHealth(): Promise<AdminPlatformHealth> {
    const res = await adminFetch('/system/health');
    return res.data;
  },

  async getAuditLogs(): Promise<AdminAuditLogItem[]> {
    const res = await adminFetch('/audit-logs');
    return res.data;
  },
};
