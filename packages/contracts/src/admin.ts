/**
 * Typing Typhon — Administrative Control Panel Contracts
 */

export interface AdminKpiItem {
  value: number;
  changePct: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface AdminUserGrowthPoint {
  date: string;
  totalUsers: number;
  newUsers: number;
}

export interface AdminUserDistribution {
  guests: { count: number; pct: number };
  registered: { count: number; pct: number };
  premium: { count: number; pct: number };
}

export interface AdminActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  timeAgo: string;
  timestamp: string;
  badge?: string;
  color?: string;
}

export interface AdminTopLessonItem {
  id: string;
  name: string;
  completions: number;
  passRate: number;
}

export interface AdminPlatformHealth {
  status: string;
  apiServer: number;
  database: number;
  fileStorage: number;
  multiplayerService: number;
  memoryUsageMb?: number;
  uptimeSeconds?: number;
  lastUpdated: string;
}

export interface AdminRecentTestItem {
  id: string;
  user: string;
  avatar: string;
  testType: string;
  wpm: number;
  accuracy: number;
  errors: number;
  duration: string;
  date: string;
}

export interface AdminCountryShare {
  country: string;
  code: string;
  sharePct: number;
  color: string;
  usersCount?: number;
}

export interface AdminPerformanceTrendPoint {
  date: string;
  wpm: number;
  accuracy: number;
  tests: number;
  practiceTimeHours: number;
}

export interface AdminDashboardData {
  kpis: {
    totalUsers: AdminKpiItem;
    newUsers: AdminKpiItem;
    testsCompleted: AdminKpiItem;
    practiceTime: AdminKpiItem;
    avgWpm: AdminKpiItem;
    avgAccuracy: AdminKpiItem;
    activeUsers?: AdminKpiItem;
  };
  userGrowth: AdminUserGrowthPoint[];
  userDistribution: AdminUserDistribution;
  recentActivity: AdminActivityItem[];
  topLessons: AdminTopLessonItem[];
  platformHealth: AdminPlatformHealth;
  performanceTrends?: AdminPerformanceTrendPoint[];
  recentTests?: AdminRecentTestItem[];
  communityMap?: AdminCountryShare[];
}

export type AdminAccountStatus = 'Active' | 'Suspended' | 'Inactive';
export type AdminAccountType = 'Registered' | 'Guest' | 'Premium';

export interface AdminUserItemDto {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: AdminAccountType;
  testsCount: number;
  avgWpm: number;
  joinedDate: string;
  status: AdminAccountStatus;
}

export interface AdminUsersListResponseDto {
  users: AdminUserItemDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: {
    totalUsers: number;
    guests: number;
    registered: number;
    premium: number;
  };
}

export interface AdminCurriculumLessonSummary {
  id: string;
  title: string;
  targetKeys: string[];
  passThreshold: { minAccuracyPct: number; minWpm: number };
  completions: number;
  passRate: number;
}

export interface AdminCurriculumStageDto {
  stageNumber: number;
  title: string;
  slug: string;
  description: string;
  lessonCount: number;
  completionPct: number;
  lessons: AdminCurriculumLessonSummary[];
}

export interface AdminAuditLogItem {
  id: string;
  actorUserId: string;
  actorName: string;
  actionType: string;
  targetEntity: string;
  targetId: string;
  diffJson?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface AdminReportData {
  reportType: string;
  dateRange: string;
  summary: {
    newUsers: number;
    returningUsers: number;
    conversionRatePct: number;
    churnRatePct: number;
  };
  chartData: Array<{ date: string; newUsers: number; totalUsers: number }>;
  records: Array<Record<string, any>>;
}
