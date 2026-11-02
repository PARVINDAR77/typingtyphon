'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  FileText,
  Clock,
  Target,
  Shield,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  GraduationCap,
  Calendar,
  ChevronDown,
  Sparkles,
  Server,
  Database,
  HardDrive,
  Gamepad2,
  CheckCircle2,
  MoreVertical,
  Globe2,
  Check,
  Star,
  Award,
  X,
  RotateCcw,
  ExternalLink,
  Download,
  Printer,
  Zap,
  MapPin,
  TrendingUp,
  Search,
} from 'lucide-react';
import { adminApi, formatNumber } from '../../lib/adminApi';
import { AdminDashboardData } from '@typingtyphon/contracts';

type PeriodType = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom';
type TrendTabType = 'wpm' | 'accuracy' | 'tests' | 'practice';

interface PeriodTelemetry {
  kpis: AdminDashboardData['kpis'];
  userGrowth: AdminDashboardData['userGrowth'];
  performanceTrends: NonNullable<AdminDashboardData['performanceTrends']>;
}

/**
 * Generate smooth cubic Bezier spline path from coordinates
 */
function generateSplinePath(pts: { x: number; y: number }[]): string {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function formatDateLabel(dStr: string): string {
  try {
    const [y, m, d] = dStr.split('-').map(Number);
    if (!y || !m || !d) return dStr;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dStr;
  }
}

function getPeriodSublabel(period: PeriodType): string {
  switch (period) {
    case '7d': return 'from last week';
    case '30d': return 'from last month';
    case '90d': return 'from last quarter';
    case '1y': return 'from last year';
    case 'all': return 'all-time';
    case 'custom': return 'previous period';
    default: return 'from last month';
  }
}

const DATE_PRESETS = [
  { id: '7d', label: 'Last 7 Days', period: '7d' as PeriodType, start: '2024-10-25', end: '2024-10-31' },
  { id: '30d', label: 'Last 30 Days', period: '30d' as PeriodType, start: '2024-10-01', end: '2024-10-31' },
  { id: '90d', label: 'Last 90 Days', period: '90d' as PeriodType, start: '2024-08-01', end: '2024-10-31' },
  { id: '1y', label: 'Past 1 Year', period: '1y' as PeriodType, start: '2023-11-01', end: '2024-10-31' },
  { id: 'thisMonth', label: 'This Month', period: '30d' as PeriodType, start: '2024-10-01', end: '2024-10-31' },
  { id: 'lastMonth', label: 'Last Month', period: 'custom' as PeriodType, start: '2024-09-01', end: '2024-09-30' },
  { id: 'today', label: 'Today', period: 'custom' as PeriodType, start: '2024-10-31', end: '2024-10-31' },
  { id: 'yesterday', label: 'Yesterday', period: 'custom' as PeriodType, start: '2024-10-30', end: '2024-10-30' },
  { id: 'all', label: 'All Time', period: 'all' as PeriodType, start: '2023-01-01', end: '2024-10-31' },
];

const PERIOD_DATA: Record<Exclude<PeriodType, 'custom'>, PeriodTelemetry> = {
  '7d': {
    kpis: {
      totalUsers: { value: 12458, changePct: 3.2, trend: 'up' },
      newUsers: { value: 198, changePct: 8.5, trend: 'up' },
      testsCompleted: { value: 284100, changePct: 14.2, trend: 'up' },
      practiceTime: { value: 3820, changePct: 18.0, trend: 'up' },
      avgWpm: { value: 54.1, changePct: 1.2, trend: 'up' },
      avgAccuracy: { value: 93.4, changePct: 0.8, trend: 'up' },
    },
    userGrowth: [
      { date: 'Oct 25', totalUsers: 12260, newUsers: 24 },
      { date: 'Oct 26', totalUsers: 12292, newUsers: 32 },
      { date: 'Oct 27', totalUsers: 12328, newUsers: 36 },
      { date: 'Oct 28', totalUsers: 12365, newUsers: 37 },
      { date: 'Oct 29', totalUsers: 12398, newUsers: 33 },
      { date: 'Oct 30', totalUsers: 12428, newUsers: 30 },
      { date: 'Oct 31', totalUsers: 12458, newUsers: 30 },
    ],
    performanceTrends: [
      { date: 'Oct 25', wpm: 52.8, accuracy: 92.5, tests: 39500, practiceTimeHours: 520 },
      { date: 'Oct 26', wpm: 53.2, accuracy: 92.8, tests: 40200, practiceTimeHours: 540 },
      { date: 'Oct 27', wpm: 53.6, accuracy: 93.0, tests: 41000, practiceTimeHours: 550 },
      { date: 'Oct 28', wpm: 54.4, accuracy: 93.2, tests: 42100, practiceTimeHours: 570 },
      { date: 'Oct 29', wpm: 55.0, accuracy: 93.5, tests: 43200, practiceTimeHours: 590 },
      { date: 'Oct 30', wpm: 54.8, accuracy: 93.3, tests: 42800, practiceTimeHours: 580 },
      { date: 'Oct 31', wpm: 55.4, accuracy: 93.6, tests: 44300, practiceTimeHours: 610 },
    ],
  },
  '30d': {
    kpis: {
      totalUsers: { value: 12458, changePct: 12, trend: 'up' },
      newUsers: { value: 842, changePct: 18, trend: 'up' },
      testsCompleted: { value: 1238450, changePct: 24, trend: 'up' },
      practiceTime: { value: 16230, changePct: 32, trend: 'up' },
      avgWpm: { value: 52.3, changePct: 6, trend: 'up' },
      avgAccuracy: { value: 92.8, changePct: 4, trend: 'up' },
    },
    userGrowth: [
      { date: 'Oct 1', totalUsers: 3000, newUsers: 450 },
      { date: 'Oct 5', totalUsers: 5000, newUsers: 600 },
      { date: 'Oct 10', totalUsers: 7200, newUsers: 850 },
      { date: 'Oct 15', totalUsers: 8900, newUsers: 1100 },
      { date: 'Oct 20', totalUsers: 9482, newUsers: 1243 },
      { date: 'Oct 25', totalUsers: 11500, newUsers: 1300 },
      { date: 'Oct 31', totalUsers: 12458, newUsers: 1400 },
    ],
    performanceTrends: [
      { date: 'Oct 1', wpm: 46.2, accuracy: 89.1, tests: 28400, practiceTimeHours: 410 },
      { date: 'Oct 5', wpm: 48.0, accuracy: 90.2, tests: 31200, practiceTimeHours: 440 },
      { date: 'Oct 10', wpm: 51.5, accuracy: 91.0, tests: 34500, practiceTimeHours: 490 },
      { date: 'Oct 15', wpm: 54.8, accuracy: 91.8, tests: 38900, practiceTimeHours: 530 },
      { date: 'Oct 18', wpm: 68.4, accuracy: 93.5, tests: 44200, practiceTimeHours: 610 },
      { date: 'Oct 20', wpm: 59.1, accuracy: 92.4, tests: 41000, practiceTimeHours: 580 },
      { date: 'Oct 25', wpm: 63.7, accuracy: 93.1, tests: 46800, practiceTimeHours: 640 },
      { date: 'Oct 31', wpm: 65.2, accuracy: 92.8, tests: 49500, practiceTimeHours: 680 },
    ],
  },
  '90d': {
    kpis: {
      totalUsers: { value: 12458, changePct: 28, trend: 'up' },
      newUsers: { value: 2640, changePct: 34, trend: 'up' },
      testsCompleted: { value: 3840000, changePct: 42, trend: 'up' },
      practiceTime: { value: 48900, changePct: 51, trend: 'up' },
      avgWpm: { value: 51.0, changePct: 8, trend: 'up' },
      avgAccuracy: { value: 92.1, changePct: 5, trend: 'up' },
    },
    userGrowth: [
      { date: 'Aug 1', totalUsers: 9818, newUsers: 680 },
      { date: 'Aug 15', totalUsers: 10250, newUsers: 720 },
      { date: 'Sep 1', totalUsers: 10840, newUsers: 810 },
      { date: 'Sep 15', totalUsers: 11420, newUsers: 940 },
      { date: 'Oct 1', totalUsers: 11890, newUsers: 1020 },
      { date: 'Oct 15', totalUsers: 12210, newUsers: 1180 },
      { date: 'Oct 31', totalUsers: 12458, newUsers: 1243 },
    ],
    performanceTrends: [
      { date: 'Aug 1', wpm: 44.5, accuracy: 88.0, tests: 24000, practiceTimeHours: 350 },
      { date: 'Aug 15', wpm: 46.2, accuracy: 89.2, tests: 27500, practiceTimeHours: 390 },
      { date: 'Sep 1', wpm: 48.0, accuracy: 90.1, tests: 31000, practiceTimeHours: 430 },
      { date: 'Sep 15', wpm: 50.4, accuracy: 91.0, tests: 35000, practiceTimeHours: 480 },
      { date: 'Oct 1', wpm: 52.8, accuracy: 91.8, tests: 39500, practiceTimeHours: 530 },
      { date: 'Oct 15', wpm: 58.2, accuracy: 92.7, tests: 44000, practiceTimeHours: 600 },
      { date: 'Oct 31', wpm: 65.2, accuracy: 93.1, tests: 49500, practiceTimeHours: 680 },
    ],
  },
  '1y': {
    kpis: {
      totalUsers: { value: 12458, changePct: 185, trend: 'up' },
      newUsers: { value: 11200, changePct: 210, trend: 'up' },
      testsCompleted: { value: 14920000, changePct: 260, trend: 'up' },
      practiceTime: { value: 195400, changePct: 310, trend: 'up' },
      avgWpm: { value: 48.6, changePct: 14, trend: 'up' },
      avgAccuracy: { value: 91.5, changePct: 7, trend: 'up' },
    },
    userGrowth: [
      { date: "Nov '23", totalUsers: 1258, newUsers: 310 },
      { date: "Jan '24", totalUsers: 2840, newUsers: 540 },
      { date: "Mar '24", totalUsers: 4920, newUsers: 780 },
      { date: "May '24", totalUsers: 6890, newUsers: 950 },
      { date: "Jul '24", totalUsers: 8940, newUsers: 1120 },
      { date: "Sep '24", totalUsers: 11050, newUsers: 1280 },
      { date: "Oct '24", totalUsers: 12458, newUsers: 1408 },
    ],
    performanceTrends: [
      { date: "Nov '23", wpm: 38.5, accuracy: 84.5, tests: 12000, practiceTimeHours: 180 },
      { date: "Jan '24", wpm: 41.2, accuracy: 86.8, tests: 18500, practiceTimeHours: 260 },
      { date: "Mar '24", wpm: 44.0, accuracy: 88.4, tests: 24500, practiceTimeHours: 340 },
      { date: "May '24", wpm: 47.8, accuracy: 90.0, tests: 32000, practiceTimeHours: 430 },
      { date: "Jul '24", wpm: 51.5, accuracy: 91.2, tests: 39000, practiceTimeHours: 520 },
      { date: "Sep '24", wpm: 56.4, accuracy: 92.5, tests: 45000, practiceTimeHours: 610 },
      { date: "Oct '24", wpm: 65.2, accuracy: 93.2, tests: 49500, practiceTimeHours: 680 },
    ],
  },
  'all': {
    kpis: {
      totalUsers: { value: 12458, changePct: 100, trend: 'up' },
      newUsers: { value: 12458, changePct: 100, trend: 'up' },
      testsCompleted: { value: 18450200, changePct: 100, trend: 'up' },
      practiceTime: { value: 242100, changePct: 100, trend: 'up' },
      avgWpm: { value: 50.8, changePct: 10, trend: 'up' },
      avgAccuracy: { value: 92.4, changePct: 6, trend: 'up' },
    },
    userGrowth: [
      { date: "Q1 '23", totalUsers: 850, newUsers: 850 },
      { date: "Q2 '23", totalUsers: 2100, newUsers: 1250 },
      { date: "Q3 '23", totalUsers: 4300, newUsers: 2200 },
      { date: "Q4 '23", totalUsers: 6800, newUsers: 2500 },
      { date: "Q1 '24", totalUsers: 8700, newUsers: 1900 },
      { date: "Q2 '24", totalUsers: 10400, newUsers: 1700 },
      { date: "Q3 '24", totalUsers: 11800, newUsers: 1400 },
      { date: "Q4 '24", totalUsers: 12458, newUsers: 658 },
    ],
    performanceTrends: [
      { date: "Q1 '23", wpm: 35.0, accuracy: 82.0, tests: 8000, practiceTimeHours: 120 },
      { date: "Q2 '23", wpm: 39.2, accuracy: 85.4, tests: 15000, practiceTimeHours: 210 },
      { date: "Q3 '23", wpm: 43.5, accuracy: 87.8, tests: 23000, practiceTimeHours: 310 },
      { date: "Q4 '23", wpm: 47.0, accuracy: 89.5, tests: 31000, practiceTimeHours: 410 },
      { date: "Q1 '24", wpm: 50.8, accuracy: 91.0, tests: 38000, practiceTimeHours: 500 },
      { date: "Q2 '24", wpm: 54.2, accuracy: 92.0, tests: 43000, practiceTimeHours: 570 },
      { date: "Q3 '24", wpm: 58.6, accuracy: 92.8, tests: 47000, practiceTimeHours: 630 },
      { date: "Q4 '24", wpm: 65.2, accuracy: 93.4, tests: 49500, practiceTimeHours: 680 },
    ],
  },
};

function getCustomRangeData(startDateStr: string, endDateStr: string): PeriodTelemetry {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const count = 7;
  const growthPts: AdminDashboardData['userGrowth'] = [];
  const trendPts: NonNullable<AdminDashboardData['performanceTrends']> = [];

  const baseUsers = Math.max(1000, Math.round(12458 - diffDays * 20));
  const userStep = Math.max(10, Math.round((12458 - baseUsers) / (count - 1)));

  for (let i = 0; i < count; i++) {
    const curDate = new Date(start.getTime() + (diffDays * (i / (count - 1))) * 24 * 60 * 60 * 1000);
    const dateLabel = curDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const totalUsers = Math.min(12458, baseUsers + i * userStep);
    const newUsers = Math.max(20, Math.round(180 + i * 30 + Math.sin(i) * 20));

    growthPts.push({
      date: dateLabel,
      totalUsers,
      newUsers,
    });

    trendPts.push({
      date: dateLabel,
      wpm: Number((48 + i * 2.2 + Math.cos(i) * 1.5).toFixed(1)),
      accuracy: Number((90.5 + i * 0.4).toFixed(1)),
      tests: Math.round(25000 + i * 3800),
      practiceTimeHours: Math.round(380 + i * 45),
    });
  }

  const scaledNewUsers = Math.max(50, Math.round(diffDays * 28));
  const scaledTests = Math.max(15000, Math.round(diffDays * 41280));
  const scaledHours = Math.max(200, Math.round(diffDays * 541));

  return {
    kpis: {
      totalUsers: { value: 12458, changePct: Math.min(99, Math.round(diffDays * 0.4)), trend: 'up' },
      newUsers: { value: scaledNewUsers, changePct: Math.min(85, Math.round(10 + diffDays * 0.2)), trend: 'up' },
      testsCompleted: { value: scaledTests, changePct: Math.min(95, Math.round(12 + diffDays * 0.3)), trend: 'up' },
      practiceTime: { value: scaledHours, changePct: Math.min(98, Math.round(15 + diffDays * 0.35)), trend: 'up' },
      avgWpm: { value: 52.3, changePct: 6, trend: 'up' },
      avgAccuracy: { value: 92.8, changePct: 4, trend: 'up' },
    },
    userGrowth: growthPts,
    performanceTrends: trendPts,
  };
}

interface CountryTelemetry {
  country: string;
  code: string;
  flag: string;
  sharePct: number;
  color: string;
  userCount: number;
  avgWpm: number;
  avgAccuracy: number;
  testsCompleted: number;
  practiceHours: number;
  topCities: string[];
  cx: number;
  cy: number;
  region: string;
}

const COMMUNITY_GEO_DATA: Record<string, CountryTelemetry> = {
  US: {
    country: 'United States',
    code: 'US',
    flag: '🇺🇸',
    sharePct: 28,
    color: '#168BFF',
    userCount: 3488,
    avgWpm: 55.8,
    avgAccuracy: 93.1,
    testsCompleted: 346800,
    practiceHours: 4540,
    topCities: ['New York', 'San Francisco', 'Chicago', 'Austin', 'Seattle'],
    cx: 64,
    cy: 52,
    region: 'North America',
  },
  IN: {
    country: 'India',
    code: 'IN',
    flag: '🇮🇳',
    sharePct: 18,
    color: '#10B981',
    userCount: 2242,
    avgWpm: 54.6,
    avgAccuracy: 92.8,
    testsCompleted: 222920,
    practiceHours: 2920,
    topCities: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'],
    cx: 216,
    cy: 86,
    region: 'South Asia',
  },
  GB: {
    country: 'United Kingdom',
    code: 'GB',
    flag: '🇬🇧',
    sharePct: 12,
    color: '#F59E0B',
    userCount: 1495,
    avgWpm: 56.9,
    avgAccuracy: 93.4,
    testsCompleted: 148600,
    practiceHours: 1950,
    topCities: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
    cx: 140,
    cy: 38,
    region: 'Western Europe',
  },
  CA: {
    country: 'Canada',
    code: 'CA',
    flag: '🇨🇦',
    sharePct: 8,
    color: '#EF4444',
    userCount: 996,
    avgWpm: 58.2,
    avgAccuracy: 93.6,
    testsCompleted: 99100,
    practiceHours: 1300,
    topCities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
    cx: 60,
    cy: 30,
    region: 'North America',
  },
  AU: {
    country: 'Australia',
    code: 'AU',
    flag: '🇦🇺',
    sharePct: 6,
    color: '#06B6D4',
    userCount: 747,
    avgWpm: 57.1,
    avgAccuracy: 93.8,
    testsCompleted: 74300,
    practiceHours: 970,
    topCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
    cx: 272,
    cy: 132,
    region: 'Oceania',
  },
  OT: {
    country: 'Others',
    code: 'OT',
    flag: '🌐',
    sharePct: 6,
    color: '#8B5CF6',
    userCount: 747,
    avgWpm: 52.4,
    avgAccuracy: 91.9,
    testsCompleted: 74300,
    practiceHours: 970,
    topCities: ['Germany', 'France', 'Japan', 'Brazil', 'Singapore'],
    cx: 168,
    cy: 102,
    region: 'Worldwide',
  },
};

const ALL_GLOBAL_COUNTRIES = [
  { rank: 1, country: 'United States', code: 'US', flag: '🇺🇸', sharePct: 28, users: 3488, avgWpm: 55.8, accuracy: 93.1, color: '#168BFF' },
  { rank: 2, country: 'India', code: 'IN', flag: '🇮🇳', sharePct: 18, users: 2242, avgWpm: 54.6, accuracy: 92.8, color: '#10B981' },
  { rank: 3, country: 'United Kingdom', code: 'GB', flag: '🇬🇧', sharePct: 12, users: 1495, avgWpm: 56.9, accuracy: 93.4, color: '#F59E0B' },
  { rank: 4, country: 'Canada', code: 'CA', flag: '🇨🇦', sharePct: 8, users: 996, avgWpm: 58.2, accuracy: 93.6, color: '#EF4444' },
  { rank: 5, country: 'Australia', code: 'AU', flag: '🇦🇺', sharePct: 6, users: 747, avgWpm: 57.1, accuracy: 93.8, color: '#06B6D4' },
  { rank: 6, country: 'Germany', code: 'DE', flag: '🇩🇪', sharePct: 5, users: 622, avgWpm: 56.0, accuracy: 93.2, color: '#8B5CF6' },
  { rank: 7, country: 'France', code: 'FR', flag: '🇫🇷', sharePct: 4, users: 498, avgWpm: 54.2, accuracy: 92.5, color: '#6366F1' },
  { rank: 8, country: 'Japan', code: 'JP', flag: '🇯🇵', sharePct: 4, users: 498, avgWpm: 60.5, accuracy: 94.2, color: '#EC4899' },
  { rank: 9, country: 'Brazil', code: 'BR', flag: '🇧🇷', sharePct: 3, users: 373, avgWpm: 51.8, accuracy: 91.6, color: '#10B981' },
  { rank: 10, country: 'Singapore', code: 'SG', flag: '🇸🇬', sharePct: 2, users: 249, avgWpm: 62.4, accuracy: 94.8, color: '#00C6FF' },
  { rank: 11, country: 'Rest of World', code: 'OT', flag: '🌐', sharePct: 10, users: 1250, avgWpm: 52.0, accuracy: 92.0, color: '#94A3B8' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('30d');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2024-10-01');
  const [customEndDate, setCustomEndDate] = useState('2024-10-31');
  const [dateError, setDateError] = useState<string | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // User Growth Series Filter & Dropdown
  const [growthSeriesFilter, setGrowthSeriesFilter] = useState<'both' | 'total' | 'new'>('both');
  const [growthDropdownOpen, setGrowthDropdownOpen] = useState(false);
  const growthDropdownRef = useRef<HTMLDivElement>(null);

  // User Distribution Filter & Dropdown
  const [distributionFilter, setDistributionFilter] = useState<'all' | 'guests' | 'registered' | 'premium'>('all');
  const [distributionDropdownOpen, setDistributionDropdownOpen] = useState(false);
  const distributionDropdownRef = useRef<HTMLDivElement>(null);

  // Performance Trends Tab & Interval
  const [trendTab, setTrendTab] = useState<TrendTabType>('wpm');
  const [trendInterval, setTrendInterval] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [trendIntervalDropdownOpen, setTrendIntervalDropdownOpen] = useState(false);
  const trendIntervalDropdownRef = useRef<HTMLDivElement>(null);

  const [userGrowthHoverIndex, setUserGrowthHoverIndex] = useState<number | null>(4);
  const [trendHoverIndex, setTrendHoverIndex] = useState<number | null>(4);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [activeMenuRow, setActiveMenuRow] = useState<string | null>(null);

  // Interactive Modals State
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [selectedTestDetail, setSelectedTestDetail] = useState<any | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [selectedCountryModal, setSelectedCountryModal] = useState<CountryTelemetry | null>(null);
  const [showAllCountriesModal, setShowAllCountriesModal] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  // Platform Health Ping Simulation
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [healthLatency, setHealthLatency] = useState({
    api: 24,
    db: 32,
    storage: 45,
    multiplayer: 61,
  });

  const handleRefreshHealth = () => {
    setIsRefreshingHealth(true);
    setTimeout(() => {
      setHealthLatency({
        api: Math.floor(19 + Math.random() * 9),
        db: Math.floor(27 + Math.random() * 11),
        storage: Math.floor(39 + Math.random() * 10),
        multiplayer: Math.floor(54 + Math.random() * 14),
      });
      setIsRefreshingHealth(false);
    }, 400);
  };

  // Live Dark Mode Observer
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateThemeState = () => {
      const isDark =
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('tt_theme') === 'dark' ||
        localStorage.getItem('typingtyphon_theme') === 'dark';
      setIsDarkMode(isDark);
    };
    updateThemeState();

    const observer = new MutationObserver(updateThemeState);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    window.addEventListener('storage', updateThemeState);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', updateThemeState);
    };
  }, []);

  const surfaceBg = isDarkMode ? '#111C3D' : '#FFFFFF';
  const surfaceBorder = isDarkMode ? '#243462' : '#E6EDF5';
  const surfaceSubtle = isDarkMode ? '#16244D' : '#F8FAFC';
  const textPrimary = isDarkMode ? '#F8FAFC' : '#15213A';
  const textSecondary = isDarkMode ? '#94A3B8' : '#64748B';
  const textMuted = isDarkMode ? '#64748B' : '#94A3B8';

  const fetchDashboard = async (period: string) => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboard(period);
      if (res) {
        setData({ ...res, period } as any);
      }
    } catch (err) {
      console.warn('Dashboard API fallback engaged for period:', period);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(selectedPeriod);
  }, [selectedPeriod]);

  // Click-outside and Escape key listener for all popovers and modals
  useEffect(() => {
    const handleClickOutsideAll = (event: MouseEvent) => {
      const target = event.target as Node;
      if (datePickerRef.current && !datePickerRef.current.contains(target)) {
        setIsDatePickerOpen(false);
      }
      if (growthDropdownRef.current && !growthDropdownRef.current.contains(target)) {
        setGrowthDropdownOpen(false);
      }
      if (distributionDropdownRef.current && !distributionDropdownRef.current.contains(target)) {
        setDistributionDropdownOpen(false);
      }
      if (trendIntervalDropdownRef.current && !trendIntervalDropdownRef.current.contains(target)) {
        setTrendIntervalDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDatePickerOpen(false);
        setGrowthDropdownOpen(false);
        setDistributionDropdownOpen(false);
        setTrendIntervalDropdownOpen(false);
        setActiveMenuRow(null);
        setSelectedActivity(null);
        setSelectedLesson(null);
        setSelectedTestDetail(null);
        setSelectedCertificate(null);
        setSelectedCountryModal(null);
        setShowAllCountriesModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideAll);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideAll);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Active date range text displayed in the button
  const activeDateRangeText = useMemo(() => {
    if (selectedPeriod === '7d') return 'Oct 25, 2024 - Oct 31, 2024';
    if (selectedPeriod === '30d') return 'Oct 1, 2024 - Oct 31, 2024';
    if (selectedPeriod === '90d') return 'Aug 1, 2024 - Oct 31, 2024';
    if (selectedPeriod === '1y') return 'Nov 1, 2023 - Oct 31, 2024';
    if (selectedPeriod === 'all') return 'Jan 1, 2023 - Present';
    return `${formatDateLabel(customStartDate)} - ${formatDateLabel(customEndDate)}`;
  }, [selectedPeriod, customStartDate, customEndDate]);

  const handlePeriodSelect = (period: PeriodType) => {
    setSelectedPeriod(period);
    setDateError(null);
    if (period === '7d') {
      setCustomStartDate('2024-10-25');
      setCustomEndDate('2024-10-31');
    } else if (period === '30d') {
      setCustomStartDate('2024-10-01');
      setCustomEndDate('2024-10-31');
    } else if (period === '90d') {
      setCustomStartDate('2024-08-01');
      setCustomEndDate('2024-10-31');
    } else if (period === '1y') {
      setCustomStartDate('2023-11-01');
      setCustomEndDate('2024-10-31');
    } else if (period === 'all') {
      setCustomStartDate('2023-01-01');
      setCustomEndDate('2024-10-31');
    }
  };

  const handlePresetClick = (preset: typeof DATE_PRESETS[0]) => {
    setCustomStartDate(preset.start);
    setCustomEndDate(preset.end);
    setSelectedPeriod(preset.period);
    setDateError(null);
    setIsDatePickerOpen(false);
  };

  const handleApplyCustomDate = () => {
    if (!customStartDate || !customEndDate) {
      setDateError('Please select both start and end dates.');
      return;
    }
    if (new Date(customStartDate) > new Date(customEndDate)) {
      setDateError('Start date must be before end date.');
      return;
    }
    setDateError(null);
    setSelectedPeriod('custom');
    setIsDatePickerOpen(false);
  };

  const handleResetDate = () => {
    setCustomStartDate('2024-10-01');
    setCustomEndDate('2024-10-31');
    setSelectedPeriod('30d');
    setDateError(null);
    setIsDatePickerOpen(false);
  };

  // Active Telemetry resolved from API or Period Data Fallback
  const currentFallback = useMemo(() => {
    if (selectedPeriod === 'custom') {
      return getCustomRangeData(customStartDate, customEndDate);
    }
    return PERIOD_DATA[selectedPeriod] || PERIOD_DATA['30d'];
  }, [selectedPeriod, customStartDate, customEndDate]);

  const kpis = useMemo(() => {
    if (data?.kpis && (data as any).period === selectedPeriod) {
      return data.kpis;
    }
    return currentFallback.kpis;
  }, [currentFallback, data, selectedPeriod]);

  const activeUserGrowth = useMemo(() => {
    if (data?.userGrowth && data.userGrowth.length > 0 && (data as any).period === selectedPeriod) {
      return data.userGrowth;
    }
    return currentFallback.userGrowth;
  }, [data, currentFallback, selectedPeriod]);

  const activeTrends = useMemo(() => {
    if (trendInterval === 'weekly') {
      return [
        { date: 'Wk 39', wpm: 48.4, accuracy: 89.8, tests: 182000, practiceTimeHours: 2400 },
        { date: 'Wk 40', wpm: 51.2, accuracy: 91.0, tests: 215000, practiceTimeHours: 2850 },
        { date: 'Wk 41', wpm: 54.0, accuracy: 91.8, tests: 248000, practiceTimeHours: 3280 },
        { date: 'Wk 42', wpm: 58.6, accuracy: 92.6, tests: 285000, practiceTimeHours: 3750 },
        { date: 'Wk 43', wpm: 63.2, accuracy: 93.1, tests: 312000, practiceTimeHours: 4120 },
        { date: 'Wk 44', wpm: 65.4, accuracy: 93.6, tests: 345000, practiceTimeHours: 4540 },
      ];
    }
    if (trendInterval === 'monthly') {
      return [
        { date: 'May', wpm: 46.5, accuracy: 88.5, tests: 780000, practiceTimeHours: 10400 },
        { date: 'Jun', wpm: 49.8, accuracy: 89.9, tests: 920000, practiceTimeHours: 12200 },
        { date: 'Jul', wpm: 52.4, accuracy: 91.2, tests: 1080000, practiceTimeHours: 14100 },
        { date: 'Aug', wpm: 56.0, accuracy: 92.0, tests: 1190000, practiceTimeHours: 15400 },
        { date: 'Sep', wpm: 60.5, accuracy: 92.8, tests: 1280000, practiceTimeHours: 16800 },
        { date: 'Oct', wpm: 65.2, accuracy: 93.4, tests: 1350000, practiceTimeHours: 17600 },
      ];
    }
    if (data?.performanceTrends && data.performanceTrends.length > 0 && (data as any).period === selectedPeriod) {
      return data.performanceTrends;
    }
    return currentFallback.performanceTrends;
  }, [trendInterval, data, currentFallback, selectedPeriod]);

  // Keep references for backwards compatibility
  const userGrowth = activeUserGrowth;
  const performanceTrends = activeTrends;

  // Safeguard hover indexes when period changes
  useEffect(() => {
    if (userGrowthHoverIndex !== null && userGrowthHoverIndex >= activeUserGrowth.length) {
      setUserGrowthHoverIndex(Math.max(0, activeUserGrowth.length - 1));
    }
  }, [activeUserGrowth, userGrowthHoverIndex]);

  useEffect(() => {
    if (trendHoverIndex !== null && trendHoverIndex >= activeTrends.length) {
      setTrendHoverIndex(Math.max(0, activeTrends.length - 1));
    }
  }, [activeTrends, trendHoverIndex]);

  // Dynamic Spline Calculations for User Growth
  const userGrowthPoints = useMemo(() => {
    const pts = activeUserGrowth;
    if (!pts || pts.length === 0) return { totalUsersPts: [], newUsersPts: [], maxVal: 15000 };
    const maxVal = Math.max(...pts.map((p) => Math.max(p.totalUsers, p.newUsers)), 1000) * 1.15;
    const xMin = 50;
    const xMax = 510;
    const yMin = 20;
    const yMax = 200;

    const totalUsersPts = pts.map((p, i) => {
      const x = pts.length === 1 ? (xMin + xMax) / 2 : xMin + (i / (pts.length - 1)) * (xMax - xMin);
      const y = yMax - (p.totalUsers / maxVal) * (yMax - yMin);
      return { x, y, val: p.totalUsers, date: p.date, idx: i };
    });

    const newUsersPts = pts.map((p, i) => {
      const x = pts.length === 1 ? (xMin + xMax) / 2 : xMin + (i / (pts.length - 1)) * (xMax - xMin);
      const y = yMax - (p.newUsers / maxVal) * (yMax - yMin);
      return { x, y, val: p.newUsers, date: p.date, idx: i };
    });

    return { totalUsersPts, newUsersPts, maxVal };
  }, [activeUserGrowth]);

  const totalUsersSpline = useMemo(() => {
    return generateSplinePath(userGrowthPoints.totalUsersPts);
  }, [userGrowthPoints.totalUsersPts]);

  const totalUsersAreaPath = useMemo(() => {
    const pts = userGrowthPoints.totalUsersPts;
    if (pts.length === 0) return '';
    return `${totalUsersSpline} L ${pts[pts.length - 1].x} 200 L ${pts[0].x} 200 Z`;
  }, [totalUsersSpline, userGrowthPoints.totalUsersPts]);

  const newUsersSpline = useMemo(() => {
    return generateSplinePath(userGrowthPoints.newUsersPts);
  }, [userGrowthPoints.newUsersPts]);

  const newUsersAreaPath = useMemo(() => {
    const pts = userGrowthPoints.newUsersPts;
    if (pts.length === 0) return '';
    return `${newUsersSpline} L ${pts[pts.length - 1].x} 200 L ${pts[0].x} 200 Z`;
  }, [newUsersSpline, userGrowthPoints.newUsersPts]);

  const distribution = data?.userDistribution || {
    guests: { count: 7715, pct: 62 },
    registered: { count: 3861, pct: 31 },
    premium: { count: 882, pct: 7 },
  };

  const donutCenterInfo = useMemo(() => {
    if (distributionFilter === 'guests') {
      return { count: formatNumber(distribution.guests.count), label: 'Guests (62%)', color: '#00D284' };
    }
    if (distributionFilter === 'registered') {
      return { count: formatNumber(distribution.registered.count), label: 'Registered (31%)', color: '#168BFF' };
    }
    if (distributionFilter === 'premium') {
      return { count: formatNumber(distribution.premium.count), label: 'Premium (7%)', color: '#8B5CF6' };
    }
    return { count: '12,458', label: 'Total Users', color: '#15213A' };
  }, [distributionFilter, distribution]);

  const recentActivity = data?.recentActivity || [
    { id: '1', user: 'Alex Johnson', avatar: 'A', action: 'Completed Speed Test - 78 WPM', timeAgo: '2 minutes ago', badge: 'check', color: '#00D2D3' },
    { id: '2', user: 'Sarah Chen', avatar: 'S', action: 'Completed Lesson 2.1 - Passed', timeAgo: '5 minutes ago', badge: 'grad', color: '#8B5CF6' },
    { id: '3', user: 'Mike Davis', avatar: 'M', action: 'Joined the platform', timeAgo: '12 minutes ago', badge: 'user', color: '#EF4444' },
    { id: '4', user: 'Emily Wilson', avatar: 'E', action: 'Completed Stage 1', timeAgo: '25 minutes ago', badge: 'award', color: '#168BFF' },
    { id: '5', user: 'David Kim', avatar: 'D', action: 'Achieved 100 WPM', timeAgo: '32 minutes ago', badge: 'star', color: '#8B5CF6' },
  ];

  const topLessons = data?.topLessons || [
    { id: '1', name: 'Home Row Basics', completions: 3245, passRate: 92, color: '#168BFF' },
    { id: '2', name: 'Keys F & J', completions: 2891, passRate: 88, color: '#8B5CF6' },
    { id: '3', name: 'Keys D & K', completions: 2654, passRate: 85, color: '#F59E0B' },
    { id: '4', name: 'Top Row Practice', completions: 2341, passRate: 82, color: '#168BFF' },
    { id: '5', name: 'Numbers & Symbols', completions: 1987, passRate: 78, color: '#EF4444' },
  ];

  const recentTests = data?.recentTests || [
    { id: 'test-1', user: 'Alex Johnson', avatar: 'A', testType: 'Words (60s)', wpm: 78, accuracy: 96, errors: 4, duration: '00:60', date: 'Oct 31, 2024 10:24 AM' },
    { id: 'test-2', user: 'Sarah Chen', avatar: 'S', testType: 'Sentences (120s)', wpm: 65, accuracy: 92, errors: 8, duration: '02:00', date: 'Oct 31, 2024 10:18 AM' },
    { id: 'test-3', user: 'Mike Davis', avatar: 'M', testType: 'Paragraph (60s)', wpm: 82, accuracy: 98, errors: 2, duration: '01:00', date: 'Oct 31, 2024 10:15 AM' },
    { id: 'test-4', user: 'Emily Wilson', avatar: 'E', testType: 'Words (30s)', wpm: 72, accuracy: 94, errors: 6, duration: '00:30', date: 'Oct 31, 2024 10:12 AM' },
  ];

  const communityCountries = data?.communityMap || [
    { country: 'United States', code: 'US', sharePct: 28, color: '#168BFF' },
    { country: 'India', code: 'IN', sharePct: 18, color: '#10B981' },
    { country: 'United Kingdom', code: 'GB', sharePct: 12, color: '#F59E0B' },
    { country: 'Canada', code: 'CA', sharePct: 8, color: '#EF4444' },
    { country: 'Australia', code: 'AU', sharePct: 6, color: '#06B6D4' },
    { country: 'Others', code: 'OT', sharePct: 6, color: '#8B5CF6' },
  ];

  // Helper for trend series
  const getTrendValue = (point?: typeof performanceTrends[0] | null) => {
    if (!point) return 0;
    switch (trendTab) {
      case 'accuracy': return point.accuracy ?? 0;
      case 'tests': return point.tests ?? 0;
      case 'practice': return point.practiceTimeHours ?? 0;
      case 'wpm': default: return point.wpm ?? 0;
    }
  };

  const getTrendUnit = () => {
    switch (trendTab) {
      case 'accuracy': return '%';
      case 'tests': return ' tests';
      case 'practice': return ' hrs';
      case 'wpm': default: return ' WPM';
    }
  };

  const getTrendMaxY = () => {
    switch (trendTab) {
      case 'accuracy': return 100;
      case 'tests': return 50000;
      case 'practice': return 800;
      case 'wpm': default: return 100;
    }
  };

  // Dynamic Spline Calculations for Performance Trends
  const trendPoints = useMemo(() => {
    const pts = activeTrends;
    if (!pts || pts.length === 0) return { trendPts: [], maxY: 100 };
    const maxY = getTrendMaxY();
    const xMin = 50;
    const xMax = 510;
    const yMin = 20;
    const yMax = 160;

    const trendPts = pts.map((p, i) => {
      const val = getTrendValue(p);
      const x = pts.length === 1 ? (xMin + xMax) / 2 : xMin + (i / (pts.length - 1)) * (xMax - xMin);
      const y = Math.max(yMin, yMax - (val / maxY) * (yMax - yMin));
      return { x, y, val, date: p.date, idx: i };
    });

    return { trendPts, maxY };
  }, [activeTrends, trendTab]);

  const trendSpline = useMemo(() => {
    return generateSplinePath(trendPoints.trendPts);
  }, [trendPoints.trendPts]);

  const trendAreaPath = useMemo(() => {
    const pts = trendPoints.trendPts;
    if (pts.length === 0) return '';
    return `${trendSpline} L ${pts[pts.length - 1].x} 160 L ${pts[0].x} 160 Z`;
  }, [trendSpline, trendPoints.trendPts]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ========================================================
          WELCOME HEADER & DATE/PERIOD FILTERS
          ======================================================== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* WELCOME BACK TITLE */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#00C6FF" fill="#00C6FF" />
            <h1 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#15213A',
              margin: 0,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              Welcome Back, Admin!
              <span style={{ fontSize: '18px' }}>✨</span>
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
            Here&apos;s what&apos;s happening with Typing Typhon today.
          </p>
        </div>

        {/* DATE RANGE & PERIOD PILL TABS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* DATE RANGE DROPDOWN ANCHOR */}
          <div ref={datePickerRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              aria-expanded={isDatePickerOpen}
              aria-label="Filter dashboard by date range"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                border: isDatePickerOpen ? '1px solid #168BFF' : '1px solid #E2E8F0',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#15213A',
                boxShadow: isDatePickerOpen
                  ? '0 0 0 3px rgba(22, 139, 255, 0.15), 0 2px 6px rgba(0,0,0,0.04)'
                  : '0 1px 3px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Calendar size={15} color="#168BFF" />
              <span>{activeDateRangeText}</span>
              <ChevronDown
                size={14}
                color={isDatePickerOpen ? '#168BFF' : '#94A3B8'}
                style={{
                  transform: isDatePickerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {/* DATE RANGE POPOVER */}
            {isDatePickerOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  zIndex: 200,
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08)',
                  width: '360px',
                  maxWidth: '92vw',
                  overflow: 'hidden',
                }}
              >
                {/* Popover Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid #F1F5F9',
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={15} color="#168BFF" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#15213A' }}>
                      Select Date Range
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    aria-label="Close date picker"
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '6px',
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>

                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Quick Presets Section */}
                  <div>
                    <div style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '8px',
                    }}>
                      Quick Presets
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '6px',
                    }}>
                      {DATE_PRESETS.map((preset) => {
                        const isSelected =
                          (preset.period !== 'custom' && selectedPeriod === preset.period) ||
                          (preset.period === 'custom' &&
                            selectedPeriod === 'custom' &&
                            customStartDate === preset.start &&
                            customEndDate === preset.end);

                        return (
                          <button
                            type="button"
                            key={preset.id}
                            onClick={() => handlePresetClick(preset)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '7px 10px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? '#0072FF' : '#334155',
                              backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                              border: isSelected ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                              cursor: 'pointer',
                              transition: 'all 0.12s ease',
                              textAlign: 'left',
                            }}
                          >
                            <span>{preset.label}</span>
                            {isSelected && <Check size={13} color="#0072FF" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', backgroundColor: '#E2E8F0' }} />

                  {/* Custom Date Range Section */}
                  <div>
                    <div style={{
                      fontSize: '10.5px',
                      fontWeight: 800,
                      color: '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '8px',
                    }}>
                      Custom Date Range
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#64748B',
                          marginBottom: '4px',
                        }}>
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={customStartDate}
                          max={customEndDate || '2025-12-31'}
                          onChange={(e) => {
                            setCustomStartDate(e.target.value);
                            setDateError(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            color: '#15213A',
                            fontWeight: 500,
                            outline: 'none',
                            backgroundColor: '#FFFFFF',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#64748B',
                          marginBottom: '4px',
                        }}>
                          End Date
                        </label>
                        <input
                          type="date"
                          value={customEndDate}
                          min={customStartDate}
                          max="2025-12-31"
                          onChange={(e) => {
                            setCustomEndDate(e.target.value);
                            setDateError(null);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            color: '#15213A',
                            fontWeight: 500,
                            outline: 'none',
                            backgroundColor: '#FFFFFF',
                          }}
                        />
                      </div>
                    </div>

                    {dateError && (
                      <div style={{
                        marginTop: '6px',
                        fontSize: '11px',
                        color: '#EF4444',
                        fontWeight: 600,
                      }}>
                        {dateError}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleResetDate}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        color: '#64748B',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>Reset</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyCustomDate}
                      style={{
                        padding: '7px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#0072FF',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 114, 255, 0.3)',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PERIOD SELECTOR PILLS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            padding: '3px',
            borderRadius: '10px',
            gap: '2px',
          }}>
            {(['7d', '30d', '90d', '1y', 'all'] as PeriodType[]).map((period) => {
              const labels: Record<string, string> = {
                '7d': '7D',
                '30d': '30D',
                '90d': '90D',
                '1y': '1Y',
                'all': 'All Time',
              };
              const isActive = selectedPeriod === period;

              return (
                <button
                  key={period}
                  onClick={() => handlePeriodSelect(period)}
                  style={{
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    backgroundColor: isActive ? '#0072FF' : 'transparent',
                    boxShadow: isActive ? '0 2px 8px rgba(0, 114, 255, 0.32)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {labels[period]}
                </button>
              );
            })}
            {selectedPeriod === 'custom' && (
              <span
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: '#0072FF',
                  boxShadow: '0 2px 8px rgba(0, 114, 255, 0.32)',
                }}
              >
                Custom
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 1: 6 METRIC SUMMARY KPI CARDS (HORIZONTAL GRID)
          ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
        gap: '12px',
      }}>
        {/* CARD 1 - TOTAL USERS */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 14px 8px 14px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#EBF5FF',
                color: '#168BFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Users size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div suppressHydrationWarning style={{ fontSize: '18px', fontWeight: 900, color: '#15213A', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {formatNumber(kpis.totalUsers.value)}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  Total Users
                </div>
              </div>
            </div>
            <div suppressHydrationWarning style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
              <span>↑</span> {kpis.totalUsers.changePct}% {getPeriodSublabel(selectedPeriod)}
            </div>
          </div>
          {/* SPARKLINE WAVE (BLUE) */}
          <div style={{ marginTop: '6px', height: '22px', width: '100%', overflow: 'hidden' }}>
            <svg viewBox="0 0 160 22" style={{ width: '100%', height: '100%' }}>
              <path d="M 0 16 Q 40 4, 80 12 T 160 6 L 160 22 L 0 22 Z" fill="rgba(22, 139, 255, 0.12)" />
              <path d="M 0 16 Q 40 4, 80 12 T 160 6" fill="none" stroke="#168BFF" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* CARD 2 - NEW USERS */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 14px 8px 14px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#ECFDF5',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <UserPlus size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div suppressHydrationWarning style={{ fontSize: '18px', fontWeight: 900, color: '#15213A', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {formatNumber(kpis.newUsers.value)}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  New Users
                </div>
              </div>
            </div>
            <div suppressHydrationWarning style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
              <span>↑</span> {kpis.newUsers.changePct}% {getPeriodSublabel(selectedPeriod)}
            </div>
          </div>
          {/* SPARKLINE WAVE (GREEN) */}
          <div style={{ marginTop: '6px', height: '22px', width: '100%', overflow: 'hidden' }}>
            <svg viewBox="0 0 160 22" style={{ width: '100%', height: '100%' }}>
              <path d="M 0 18 Q 30 12, 70 6 T 160 3 L 160 22 L 0 22 Z" fill="rgba(16, 185, 129, 0.12)" />
              <path d="M 0 18 Q 30 12, 70 6 T 160 3" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* CARD 3 - TESTS COMPLETED */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 14px 8px 14px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#F3E8FF',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FileText size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div suppressHydrationWarning style={{ fontSize: '18px', fontWeight: 900, color: '#15213A', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {formatNumber(kpis.testsCompleted.value)}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  Tests Completed
                </div>
              </div>
            </div>
            <div suppressHydrationWarning style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
              <span>↑</span> {kpis.testsCompleted.changePct}% {getPeriodSublabel(selectedPeriod)}
            </div>
          </div>
          {/* SPARKLINE WAVE (PURPLE) */}
          <div style={{ marginTop: '6px', height: '22px', width: '100%', overflow: 'hidden' }}>
            <svg viewBox="0 0 160 22" style={{ width: '100%', height: '100%' }}>
              <path d="M 0 14 Q 40 20, 80 8 T 160 4 L 160 22 L 0 22 Z" fill="rgba(139, 92, 246, 0.12)" />
              <path d="M 0 14 Q 40 20, 80 8 T 160 4" fill="none" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* CARD 4 - TOTAL PRACTICE TIME */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 14px 8px 14px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#FFFBEB',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Clock size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div suppressHydrationWarning style={{ fontSize: '18px', fontWeight: 900, color: '#15213A', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {formatNumber(kpis.practiceTime.value)} hrs
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  Total Practice Time
                </div>
              </div>
            </div>
            <div suppressHydrationWarning style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
              <span>↑</span> {kpis.practiceTime.changePct}% {getPeriodSublabel(selectedPeriod)}
            </div>
          </div>
          {/* SPARKLINE WAVE (ORANGE) */}
          <div style={{ marginTop: '6px', height: '22px', width: '100%', overflow: 'hidden' }}>
            <svg viewBox="0 0 160 22" style={{ width: '100%', height: '100%' }}>
              <path d="M 0 17 Q 50 5, 100 14 T 160 8 L 160 22 L 0 22 Z" fill="rgba(245, 158, 11, 0.12)" />
              <path d="M 0 17 Q 50 5, 100 14 T 160 8" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* CARD 5 - AVG WPM */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 14px 8px 14px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#FEE2E2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Target size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div suppressHydrationWarning style={{ fontSize: '18px', fontWeight: 900, color: '#15213A', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {kpis.avgWpm.value}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  Avg. WPM
                </div>
              </div>
            </div>
            <div suppressHydrationWarning style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
              <span>↑</span> {kpis.avgWpm.changePct}% {getPeriodSublabel(selectedPeriod)}
            </div>
          </div>
          {/* SPARKLINE WAVE (RED) */}
          <div style={{ marginTop: '6px', height: '22px', width: '100%', overflow: 'hidden' }}>
            <svg viewBox="0 0 160 22" style={{ width: '100%', height: '100%' }}>
              <path d="M 0 12 Q 40 16, 90 6 T 160 12 L 160 22 L 0 22 Z" fill="rgba(239, 68, 68, 0.12)" />
              <path d="M 0 12 Q 40 16, 90 6 T 160 12" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* CARD 6 - AVG ACCURACY */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '14px 14px 8px 14px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#D1FAE5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Shield size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div suppressHydrationWarning style={{ fontSize: '18px', fontWeight: 900, color: '#15213A', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {kpis.avgAccuracy.value}%
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  Avg. Accuracy
                </div>
              </div>
            </div>
            <div suppressHydrationWarning style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
              <span>↑</span> {kpis.avgAccuracy.changePct}% {getPeriodSublabel(selectedPeriod)}
            </div>
          </div>
          {/* SPARKLINE WAVE (TEAL) */}
          <div style={{ marginTop: '6px', height: '22px', width: '100%', overflow: 'hidden' }}>
            <svg viewBox="0 0 160 22" style={{ width: '100%', height: '100%' }}>
              <path d="M 0 14 Q 50 8, 100 16 T 160 4 L 160 22 L 0 22 Z" fill="rgba(5, 150, 105, 0.12)" />
              <path d="M 0 14 Q 50 8, 100 16 T 160 4" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 2: USER GROWTH (42%) + USER DISTRIBUTION (30%) + RECENT ACTIVITY (28%)
          ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '20px',
      }}>
        {/* CARD 1: USER GROWTH LINE & AREA CHART (5 OF 12) */}
        <div style={{
          gridColumn: 'span 5',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px 24px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#F3E8FF',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BarChart3 size={16} />
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#15213A', margin: 0 }}>
                User Growth
              </h2>
            </div>

            {/* SERIES FILTER DROPDOWN ANCHOR */}
            <div ref={growthDropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setGrowthDropdownOpen(!growthDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  backgroundColor: growthDropdownOpen ? '#F1F5F9' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setGrowthSeriesFilter(prev => prev === 'total' ? 'both' : 'total');
                  }}
                  title="Click to toggle Total Users series"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: growthSeriesFilter === 'new' ? '#94A3B8' : '#52627A',
                    opacity: growthSeriesFilter === 'new' ? 0.45 : 1,
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#168BFF' }} />
                  <span>Total Users</span>
                </div>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setGrowthSeriesFilter(prev => prev === 'new' ? 'both' : 'new');
                  }}
                  title="Click to toggle New Users series"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: growthSeriesFilter === 'total' ? '#94A3B8' : '#52627A',
                    opacity: growthSeriesFilter === 'total' ? 0.45 : 1,
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span>New Users</span>
                </div>

                <ChevronDown
                  size={14}
                  color="#94A3B8"
                  style={{
                    transform: growthDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </div>

              {/* DROPDOWN MENU */}
              {growthDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                  padding: '6px',
                  zIndex: 30,
                  fontSize: '11.5px',
                  minWidth: '170px',
                }}>
                  <div
                    onClick={() => { setGrowthSeriesFilter('both'); setGrowthDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: growthSeriesFilter === 'both' ? 700 : 500,
                      color: growthSeriesFilter === 'both' ? '#168BFF' : '#15213A',
                      backgroundColor: growthSeriesFilter === 'both' ? '#EFF6FF' : 'transparent',
                    }}
                  >
                    <span>Both Series</span>
                    {growthSeriesFilter === 'both' && <Check size={13} color="#168BFF" />}
                  </div>
                  <div
                    onClick={() => { setGrowthSeriesFilter('total'); setGrowthDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: growthSeriesFilter === 'total' ? 700 : 500,
                      color: growthSeriesFilter === 'total' ? '#168BFF' : '#15213A',
                      backgroundColor: growthSeriesFilter === 'total' ? '#EFF6FF' : 'transparent',
                    }}
                  >
                    <span>Total Users Only</span>
                    {growthSeriesFilter === 'total' && <Check size={13} color="#168BFF" />}
                  </div>
                  <div
                    onClick={() => { setGrowthSeriesFilter('new'); setGrowthDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: growthSeriesFilter === 'new' ? 700 : 500,
                      color: growthSeriesFilter === 'new' ? '#168BFF' : '#15213A',
                      backgroundColor: growthSeriesFilter === 'new' ? '#EFF6FF' : 'transparent',
                    }}
                  >
                    <span>New Users Only</span>
                    {growthSeriesFilter === 'new' && <Check size={13} color="#168BFF" />}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SVG CHART CONTAINER */}
          <div style={{ position: 'relative', width: '100%', height: '220px' }}>
            <svg
              viewBox="0 0 540 220"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="userGrowthBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#168BFF" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#168BFF" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="userGrowthGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              <line x1="36" y1="20" x2="520" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
              <text x="28" y="24" fill="#94A3B8" fontSize="10" textAnchor="end">15K</text>

              <line x1="36" y1="60" x2="520" y2="60" stroke="#F1F5F9" strokeDasharray="3 3" />
              <text x="28" y="64" fill="#94A3B8" fontSize="10" textAnchor="end">12K</text>

              <line x1="36" y1="100" x2="520" y2="100" stroke="#F1F5F9" strokeDasharray="3 3" />
              <text x="28" y="104" fill="#94A3B8" fontSize="10" textAnchor="end">9K</text>

              <line x1="36" y1="140" x2="520" y2="140" stroke="#F1F5F9" strokeDasharray="3 3" />
              <text x="28" y="144" fill="#94A3B8" fontSize="10" textAnchor="end">6K</text>

              <line x1="36" y1="180" x2="520" y2="180" stroke="#F1F5F9" strokeDasharray="3 3" />
              <text x="28" y="184" fill="#94A3B8" fontSize="10" textAnchor="end">3K</text>

              <line x1="36" y1="200" x2="520" y2="200" stroke="#E2E8F0" />
              <text x="28" y="204" fill="#94A3B8" fontSize="10" textAnchor="end">0</text>

              {/* Area Gradient Total Users */}
              {growthSeriesFilter !== 'new' && (
                <path
                  d={totalUsersAreaPath}
                  fill="url(#userGrowthBlueGrad)"
                />
              )}

              {/* Spline Total Users (Blue) */}
              {growthSeriesFilter !== 'new' && (
                <path
                  d={totalUsersSpline}
                  fill="none"
                  stroke="#168BFF"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              )}

              {/* Area Gradient New Users */}
              {growthSeriesFilter !== 'total' && (
                <path
                  d={newUsersAreaPath}
                  fill="url(#userGrowthGreenGrad)"
                />
              )}

              {/* Spline New Users (Green) */}
              {growthSeriesFilter !== 'total' && (
                <path
                  d={newUsersSpline}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Interactive Data Points along the curve */}
              {userGrowthPoints.totalUsersPts.map((pt) => {
                const isHovered = userGrowthHoverIndex === pt.idx;
                const npt = userGrowthPoints.newUsersPts[pt.idx];
                return (
                  <g key={pt.idx} style={{ cursor: 'pointer' }} onMouseEnter={() => setUserGrowthHoverIndex(pt.idx)}>
                    {growthSeriesFilter !== 'new' && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 4}
                        fill="#168BFF"
                        stroke="#FFFFFF"
                        strokeWidth={isHovered ? 3 : 2}
                      />
                    )}
                    {growthSeriesFilter !== 'total' && npt && (
                      <circle
                        cx={npt.x}
                        cy={npt.y}
                        r={isHovered ? 5 : 3.5}
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth={isHovered ? 2.5 : 1.5}
                      />
                    )}
                  </g>
                );
              })}

              {/* X-Axis Date Labels */}
              {userGrowthPoints.totalUsersPts.map((pt) => (
                <text key={pt.idx} x={pt.x} y="218" fill="#94A3B8" fontSize="10.5" textAnchor="middle">
                  {pt.date}
                </text>
              ))}
            </svg>

            {/* FLOATING TOOLTIP */}
            {userGrowthHoverIndex !== null && userGrowth[userGrowthHoverIndex] && userGrowthPoints.totalUsersPts[userGrowthHoverIndex] && (
              <div style={{
                position: 'absolute',
                left: `${(userGrowthPoints.totalUsersPts[userGrowthHoverIndex].x / 540) * 100}%`,
                top: '18px',
                transform: 'translateX(-50%)',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 6px 20px rgba(15, 23, 42, 0.14)',
                border: '1px solid #E2E8F0',
                pointerEvents: 'none',
                zIndex: 10,
                fontSize: '11px',
                whiteSpace: 'nowrap',
              }}>
                <div style={{ color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                  {userGrowth[userGrowthHoverIndex].date}, 2024
                </div>
                {growthSeriesFilter !== 'new' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#168BFF' }} />
                    <span style={{ color: '#0F172A', fontWeight: 600 }}>Total Users: <b>{formatNumber(userGrowth[userGrowthHoverIndex]?.totalUsers)}</b></span>
                  </div>
                )}
                {growthSeriesFilter !== 'total' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span style={{ color: '#0F172A', fontWeight: 600 }}>New Users: <b>{formatNumber(userGrowth[userGrowthHoverIndex]?.newUsers)}</b></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: USER DISTRIBUTION DONUT (4 OF 12) */}
        <div style={{
          gridColumn: 'span 4',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px 24px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#EBF5FF',
                color: '#168BFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PieChartIcon size={16} />
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#15213A', margin: 0 }}>
                User Distribution
              </h2>
            </div>

            {/* INTERACTIVE DISTRIBUTION DROPDOWN */}
            <div ref={distributionDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDistributionDropdownOpen(!distributionDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#52627A',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span>
                  {distributionFilter === 'all' && 'All Users'}
                  {distributionFilter === 'guests' && 'Guests Only'}
                  {distributionFilter === 'registered' && 'Registered Only'}
                  {distributionFilter === 'premium' && 'Premium Only'}
                </span>
                <ChevronDown
                  size={13}
                  color="#94A3B8"
                  style={{
                    transform: distributionDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {distributionDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                  padding: '6px',
                  zIndex: 30,
                  fontSize: '11.5px',
                  minWidth: '160px',
                }}>
                  {[
                    { id: 'all', label: 'All Users (100%)' },
                    { id: 'guests', label: 'Guests Only (62%)' },
                    { id: 'registered', label: 'Registered Only (31%)' },
                    { id: 'premium', label: 'Premium Only (7%)' },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setDistributionFilter(opt.id as any);
                        setDistributionDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: distributionFilter === opt.id ? 700 : 500,
                        color: distributionFilter === opt.id ? '#168BFF' : '#15213A',
                        backgroundColor: distributionFilter === opt.id ? '#EFF6FF' : 'transparent',
                      }}
                    >
                      <span>{opt.label}</span>
                      {distributionFilter === opt.id && <Check size={13} color="#168BFF" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DONUT & LEGEND IN 2 COLUMNS */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginTop: '8px',
          }}>
            {/* SVG DONUT CHART */}
            <div style={{
              position: 'relative',
              width: '150px',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                {/* Background Ring */}
                <circle cx="75" cy="75" r="54" fill="transparent" stroke="#F1F5F9" strokeWidth="22" />

                {/* Segment 1: Guests 62% - Cyan / Green (#00D284) */}
                <circle
                  cx="75"
                  cy="75"
                  r="54"
                  fill="transparent"
                  stroke="#00D284"
                  strokeWidth={distributionFilter === 'guests' ? 26 : 21}
                  strokeDasharray="339.3"
                  strokeDashoffset="128.9"
                  transform="rotate(-90 75 75)"
                  strokeLinecap="butt"
                  opacity={distributionFilter === 'all' || distributionFilter === 'guests' ? 1 : 0.3}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setDistributionFilter(prev => prev === 'guests' ? 'all' : 'guests')}
                />

                {/* Segment 2: Registered 31% - Blue (#168BFF) */}
                <circle
                  cx="75"
                  cy="75"
                  r="54"
                  fill="transparent"
                  stroke="#168BFF"
                  strokeWidth={distributionFilter === 'registered' ? 26 : 21}
                  strokeDasharray="339.3"
                  strokeDashoffset="234.1"
                  transform="rotate(133 75 75)"
                  strokeLinecap="butt"
                  opacity={distributionFilter === 'all' || distributionFilter === 'registered' ? 1 : 0.3}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setDistributionFilter(prev => prev === 'registered' ? 'all' : 'registered')}
                />

                {/* Segment 3: Premium 7% - Purple (#8B5CF6) */}
                <circle
                  cx="75"
                  cy="75"
                  r="54"
                  fill="transparent"
                  stroke="#8B5CF6"
                  strokeWidth={distributionFilter === 'premium' ? 26 : 21}
                  strokeDasharray="339.3"
                  strokeDashoffset="315.5"
                  transform="rotate(244 75 75)"
                  strokeLinecap="butt"
                  opacity={distributionFilter === 'all' || distributionFilter === 'premium' ? 1 : 0.3}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setDistributionFilter(prev => prev === 'premium' ? 'all' : 'premium')}
                />
              </svg>

              {/* DYNAMIC CENTER DISPLAY */}
              <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
                <div suppressHydrationWarning style={{ fontSize: '18px', fontWeight: 900, color: donutCenterInfo.color, lineHeight: 1.1 }}>
                  {donutCenterInfo.count}
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>
                  {donutCenterInfo.label}
                </div>
              </div>
            </div>

            {/* LEGEND ON RIGHT (CLICKABLE TOGGLE) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              <div
                onClick={() => setDistributionFilter(prev => prev === 'guests' ? 'all' : 'guests')}
                style={{
                  cursor: 'pointer',
                  opacity: distributionFilter === 'all' || distributionFilter === 'guests' ? 1 : 0.45,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#15213A' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D284' }} />
                  <span>Guests</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginLeft: '14px', marginTop: '2px' }}>
                  <b>62%</b> (7,715)
                </div>
              </div>

              <div
                onClick={() => setDistributionFilter(prev => prev === 'registered' ? 'all' : 'registered')}
                style={{
                  cursor: 'pointer',
                  opacity: distributionFilter === 'all' || distributionFilter === 'registered' ? 1 : 0.45,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#15213A' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#168BFF' }} />
                  <span>Registered</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginLeft: '14px', marginTop: '2px' }}>
                  <b>31%</b> (3,861)
                </div>
              </div>

              <div
                onClick={() => setDistributionFilter(prev => prev === 'premium' ? 'all' : 'premium')}
                style={{
                  cursor: 'pointer',
                  opacity: distributionFilter === 'all' || distributionFilter === 'premium' ? 1 : 0.45,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#15213A' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                  <span>Premium</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginLeft: '14px', marginTop: '2px' }}>
                  <b>7%</b> (882)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: RECENT USER ACTIVITY (3 OF 12) */}
        <div style={{
          gridColumn: 'span 3',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px 20px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#EBF5FF',
                color: '#168BFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Clock size={16} />
              </div>
              <h2 style={{ fontSize: '14.5px', fontWeight: 800, color: '#15213A', margin: 0 }}>
                Recent User Activity
              </h2>
            </div>
            <Link
              href="/admin/users"
              style={{ fontSize: '11.5px', fontWeight: 700, color: '#168BFF', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>

          {/* LIST OF 5 ACTIVITIES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivity.map((act) => (
              <div
                key={act.id}
                onClick={() => setSelectedActivity(act)}
                title="Click to view activity telemetry details"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '6px 8px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* AVATAR BADGE */}
                <div style={{
                  position: 'relative',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#EBF5FF',
                  color: '#168BFF',
                  fontWeight: 800,
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {act.avatar}
                  <span style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: act.badge === 'check' ? '#10B981' : act.badge === 'grad' ? '#8B5CF6' : act.badge === 'award' ? '#F59E0B' : act.badge === 'star' ? '#F59E0B' : '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #FFFFFF',
                  }}>
                    {act.badge === 'check' && <Check size={8} color="#FFFFFF" strokeWidth={3} />}
                    {act.badge === 'grad' && <GraduationCap size={8} color="#FFFFFF" />}
                    {act.badge === 'award' && <Award size={8} color="#FFFFFF" />}
                    {act.badge === 'star' && <Star size={8} color="#FFFFFF" fill="#FFFFFF" />}
                    {act.badge === 'user' && <Users size={7} color="#FFFFFF" />}
                  </span>
                </div>

                {/* DETAILS */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#15213A', lineHeight: 1.2 }}>
                    {act.user}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '2px' }}>
                    {act.action}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px' }}>
                    {act.timeAgo}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 3: TYPING TRENDS (42%) + TOP LESSONS (30%) + HEALTH (28%)
          ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '20px',
      }}>
        {/* CARD 1: TYPING PERFORMANCE TRENDS (5 OF 12) */}
        <div style={{
          gridColumn: 'span 5',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px 24px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#F3E8FF',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Activity size={16} />
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#15213A', margin: 0 }}>
                Typing Performance Trends
              </h2>
            </div>

            {/* INTERACTIVE INTERVAL DROPDOWN */}
            <div ref={trendIntervalDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setTrendIntervalDropdownOpen(!trendIntervalDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#52627A',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <span>
                  {trendInterval === 'daily' && 'Daily'}
                  {trendInterval === 'weekly' && 'Weekly'}
                  {trendInterval === 'monthly' && 'Monthly'}
                </span>
                <ChevronDown
                  size={13}
                  color="#94A3B8"
                  style={{
                    transform: trendIntervalDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {trendIntervalDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                  padding: '6px',
                  zIndex: 30,
                  fontSize: '11.5px',
                  minWidth: '150px',
                }}>
                  {[
                    { id: 'daily', label: 'Daily (Last 30 Days)' },
                    { id: 'weekly', label: 'Weekly (Aggregated)' },
                    { id: 'monthly', label: 'Monthly (Last 6 Months)' },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        setTrendInterval(opt.id as any);
                        setTrendIntervalDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: trendInterval === opt.id ? 700 : 500,
                        color: trendInterval === opt.id ? '#8B5CF6' : '#15213A',
                        backgroundColor: trendInterval === opt.id ? '#F5F3FF' : 'transparent',
                      }}
                    >
                      <span>{opt.label}</span>
                      {trendInterval === opt.id && <Check size={13} color="#8B5CF6" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TAB SWITCHER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            padding: '3px',
            borderRadius: '9px',
            gap: '2px',
            marginBottom: '14px',
            width: 'fit-content',
          }}>
            {(['wpm', 'accuracy', 'tests', 'practice'] as TrendTabType[]).map((tab) => {
              const labels: Record<TrendTabType, string> = {
                wpm: 'WPM',
                accuracy: 'Accuracy',
                tests: 'Tests',
                practice: 'Practice Time',
              };
              const isActive = trendTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setTrendTab(tab)}
                  style={{
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '7px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    backgroundColor: isActive ? '#168BFF' : 'transparent',
                    boxShadow: isActive ? '0 2px 6px rgba(22, 139, 255, 0.3)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* PURPLE SPLINE AREA CHART */}
          <div style={{ position: 'relative', width: '100%', height: '180px' }}>
            <svg
              viewBox="0 0 540 180"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="trendPurpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="32" y1="20" x2="520" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
              <text x="24" y="24" fill="#94A3B8" fontSize="10" textAnchor="end">100</text>

              <line x1="32" y1="55" x2="520" y2="55" stroke="#F1F5F9" strokeDasharray="3 3" />
              <text x="24" y="59" fill="#94A3B8" fontSize="10" textAnchor="end">80</text>

              <line x1="32" y1="90" x2="520" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
              <text x="24" y="94" fill="#94A3B8" fontSize="10" textAnchor="end">60</text>

              <line x1="32" y1="125" x2="520" y2="125" stroke="#F1F5F9" strokeDasharray="3 3" />
              <text x="24" y="129" fill="#94A3B8" fontSize="10" textAnchor="end">40</text>

              <line x1="32" y1="160" x2="520" y2="160" stroke="#E2E8F0" />
              <text x="24" y="164" fill="#94A3B8" fontSize="10" textAnchor="end">0</text>

              {/* Area Gradient */}
              <path
                d={trendAreaPath}
                fill="url(#trendPurpleGrad)"
              />

              {/* Spline Path */}
              <path
                d={trendSpline}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              {/* Data points */}
              {trendPoints.trendPts.map((pt) => {
                const isHovered = trendHoverIndex === pt.idx;
                return (
                  <circle
                    key={pt.idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : 4}
                    fill="#8B5CF6"
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? 3 : 2}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setTrendHoverIndex(pt.idx)}
                  />
                );
              })}

              {/* X Axis Labels */}
              {trendPoints.trendPts.map((pt) => (
                <text key={pt.idx} x={pt.x} y="176" fill="#94A3B8" fontSize="10" textAnchor="middle">
                  {pt.date}
                </text>
              ))}
            </svg>

            {/* FLOATING TOOLTIP */}
            {trendHoverIndex !== null && performanceTrends[trendHoverIndex] && trendPoints.trendPts[trendHoverIndex] && (
              <div style={{
                position: 'absolute',
                left: `${(trendPoints.trendPts[trendHoverIndex].x / 540) * 100}%`,
                top: '12px',
                transform: 'translateX(-50%)',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '6px 12px',
                boxShadow: '0 6px 20px rgba(15, 23, 42, 0.14)',
                border: '1px solid #E2E8F0',
                pointerEvents: 'none',
                zIndex: 10,
                fontSize: '11px',
                whiteSpace: 'nowrap',
              }}>
                <div style={{ color: '#64748B', fontWeight: 600 }}>
                  {performanceTrends[trendHoverIndex].date}, 2024
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#8B5CF6' }} />
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>
                    Avg. {trendTab.toUpperCase()}: {getTrendValue(performanceTrends[trendHoverIndex])}{getTrendUnit()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: TOP PERFORMING LESSONS (4 OF 12) */}
        <div style={{
          gridColumn: 'span 4',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '18px 18px 14px 18px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}>
          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#F3E8FF',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <GraduationCap size={16} />
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#15213A', margin: 0 }}>
                Top Performing Lessons
              </h2>
            </div>
            <Link
              href="/admin/curriculum"
              style={{ fontSize: '11.5px', fontWeight: 700, color: '#168BFF', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>

          {/* LIST OF 5 LESSONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topLessons.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedLesson(item)}
                title="Click to view lesson curriculum drilldown"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  padding: '5px 8px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  {/* NUMBER BADGE */}
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '7px',
                    backgroundColor: idx === 0 ? '#EBF5FF' : idx === 1 ? '#F3E8FF' : idx === 2 ? '#FFFBEB' : idx === 3 ? '#EBF5FF' : '#FEE2E2',
                    color: idx === 0 ? '#168BFF' : idx === 1 ? '#8B5CF6' : idx === 2 ? '#F59E0B' : idx === 3 ? '#168BFF' : '#EF4444',
                    fontWeight: 900,
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#15213A', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {formatNumber(item.completions)} completions
                    </div>
                  </div>
                </div>

                {/* PROGRESS BAR */}
                <div style={{ width: '42px', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden', flexShrink: 0, margin: '0 2px' }}>
                  <div style={{ width: `${item.passRate}%`, height: '100%', backgroundColor: '#168BFF', borderRadius: '999px' }} />
                </div>

                {/* PASS RATE BADGE */}
                <div style={{
                  padding: '2px 7px',
                  borderRadius: '999px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  backgroundColor: item.passRate >= 80 ? '#ECFDF5' : '#FEF2F2',
                  color: item.passRate >= 80 ? '#10B981' : '#EF4444',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>
                  {item.passRate}% pass rate
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 3: PLATFORM HEALTH (3 OF 12) */}
        <div style={{
          gridColumn: 'span 3',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px 20px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          {/* HEADER */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#EBF5FF',
                  color: '#168BFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Shield size={16} />
                </div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#15213A', margin: 0 }}>
                  Platform Health
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleRefreshHealth}
                  title="Simulate live ping to cluster"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#64748B',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <RotateCcw size={11} style={{ animation: isRefreshingHealth ? 'spin 0.6s linear infinite' : 'none' }} />
                  <span>Ping</span>
                </button>
                <Link
                  href="/admin/health"
                  style={{ fontSize: '11.5px', fontWeight: 700, color: '#168BFF', textDecoration: 'none' }}
                >
                  View All
                </Link>
              </div>
            </div>

            {/* STATUS BADGE WITH LIVE PULSING DOT */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              marginBottom: '18px',
            }}>
              <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
                <span style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  opacity: 0.75,
                  animation: 'ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite',
                }} />
                <span style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              </span>
              <span>All Systems Operational</span>
            </div>

            {/* SERVICE HEALTH ROWS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#52627A', fontWeight: 600 }}>
                  <Server size={15} color="#10B981" />
                  <span>API Server</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>100%</span>
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>{healthLatency.api}ms</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#52627A', fontWeight: 600 }}>
                  <Database size={15} color="#10B981" />
                  <span>Database</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>100%</span>
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>{healthLatency.db}ms</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#52627A', fontWeight: 600 }}>
                  <HardDrive size={15} color="#10B981" />
                  <span>File Storage</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>100%</span>
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>{healthLatency.storage}ms</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#52627A', fontWeight: 600 }}>
                  <Gamepad2 size={15} color="#10B981" />
                  <span>Multiplayer Service</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>99.9%</span>
                  <span style={{ color: '#94A3B8', fontSize: '11px' }}>{healthLatency.multiplayer}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ROW 4: RECENT TESTS (60%) + COMMUNITY MAP (40%)
          ======================================================== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '20px',
      }}>
        {/* CARD 1: RECENT TESTS DATA TABLE (7 OF 12) */}
        <div style={{
          gridColumn: 'span 7',
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '22px 24px',
          border: '1px solid #E6EDF5',
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
        }}>
          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#F3E8FF',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FileText size={16} />
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#15213A', margin: 0 }}>
                Recent Tests
              </h2>
            </div>
            <Link
              href="/admin/tests"
              style={{ fontSize: '11.5px', fontWeight: 700, color: '#168BFF', textDecoration: 'none' }}
            >
              View All
            </Link>
          </div>

          {/* TABLE */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ color: '#71819A', borderBottom: '1px solid #F1F5F9', fontWeight: 600 }}>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Test Type</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>WPM</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Accuracy</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Errors</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Duration</th>
                  <th style={{ padding: '8px 6px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {recentTests.map((t) => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* USER */}
                    <td style={{ padding: '10px 6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: '#EBF5FF',
                          color: '#168BFF',
                          fontWeight: 800,
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {t.avatar}
                        </div>
                        <span style={{ fontWeight: 700, color: '#15213A', whiteSpace: 'nowrap' }}>
                          {t.user}
                        </span>
                      </div>
                    </td>

                    {/* TEST TYPE */}
                    <td style={{ padding: '10px 6px', color: '#52627A', whiteSpace: 'nowrap' }}>
                      {t.testType}
                    </td>

                    {/* WPM */}
                    <td style={{ padding: '10px 6px', fontWeight: 800, color: '#15213A' }}>
                      {t.wpm}
                    </td>

                    {/* ACCURACY */}
                    <td style={{ padding: '10px 6px', fontWeight: 700, color: '#10B981' }}>
                      {t.accuracy}%
                    </td>

                    {/* ERRORS */}
                    <td style={{ padding: '10px 6px', color: '#64748B' }}>
                      {t.errors}
                    </td>

                    {/* DURATION */}
                    <td style={{ padding: '10px 6px', color: '#64748B' }}>
                      {t.duration}
                    </td>

                    {/* DATE */}
                    <td style={{ padding: '10px 6px', color: '#94A3B8', whiteSpace: 'nowrap', fontSize: '11px' }}>
                      {t.date}
                    </td>

                    {/* ACTION MENU */}
                    <td style={{ padding: '10px 6px', textAlign: 'center', position: 'relative' }}>
                      <button
                        onClick={() => setActiveMenuRow(activeMenuRow === t.id ? null : t.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                        }}
                      >
                        <MoreVertical size={14} />
                      </button>

                      {activeMenuRow === t.id && (
                        <div style={{
                          position: 'absolute',
                          right: '10px',
                          top: '32px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                          padding: '6px',
                          zIndex: 20,
                          fontSize: '11px',
                          whiteSpace: 'nowrap',
                          textAlign: 'left',
                        }}>
                          <div
                            onClick={() => { setSelectedTestDetail(t); setActiveMenuRow(null); }}
                            style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 600, color: '#15213A' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            View Telemetry
                          </div>
                          <div
                            onClick={() => { setSelectedCertificate(t); setActiveMenuRow(null); }}
                            style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', color: '#168BFF', fontWeight: 600 }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            Export Certificate
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CARD 2: COMMUNITY MAP (5 OF 12) - WITH DISTINCT INDIA & INTERACTIVE HUBS */}
        <div style={{
          gridColumn: 'span 5',
          backgroundColor: surfaceBg,
          borderRadius: '14px',
          padding: '22px 24px',
          border: `1px solid ${surfaceBorder}`,
          boxShadow: '0 2px 8px rgba(22, 139, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
        }}>
          {/* HEADER */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: isDarkMode ? '#281E48' : '#F3E8FF',
                color: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Globe2 size={16} />
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, color: textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Community Map</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#10B981', backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5', padding: '1px 6px', borderRadius: '999px' }}>
                    Live
                  </span>
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAllCountriesModal(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#168BFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#1E2C52' : '#EFF6FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>View All</span>
              <ExternalLink size={12} />
            </button>
          </div>

          {/* TWO COLUMN CONTENT: SVG MAP & BREAKDOWN */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* SVG WORLD MAP SILHOUETTE */}
            <div style={{ flex: 1, position: 'relative', height: '175px', borderRadius: '10px', overflow: 'hidden', backgroundColor: isDarkMode ? '#0A1227' : '#F8FAFC', border: isDarkMode ? '1px solid #1E2C52' : '1px solid #EEF2F6' }}>
              <svg viewBox="0 0 320 170" style={{ width: '100%', height: '100%' }}>
                {/* Subtle Longitude/Latitude Grid Lines */}
                <line x1="0" y1="56" x2="320" y2="56" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.6" />
                <line x1="0" y1="112" x2="320" y2="112" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.6" />
                <line x1="80" y1="0" x2="80" y2="170" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.5" />
                <line x1="160" y1="0" x2="160" y2="170" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.5" />
                <line x1="240" y1="0" x2="240" y2="170" stroke={isDarkMode ? '#16244D' : '#E2E8F0'} strokeWidth="0.5" strokeDasharray="2,3" opacity="0.5" />

                {/* 1. North America (Canada & United States) */}
                <path
                  d="M 22 28 C 28 14, 55 12, 85 16 C 98 12, 114 18, 112 28 C 110 38, 100 44, 95 46 C 92 50, 96 60, 92 68 C 86 76, 78 72, 72 70 C 66 74, 60 82, 54 80 C 46 76, 44 68, 38 64 C 28 66, 24 58, 20 48 C 16 38, 18 32, 22 28 Z"
                  fill={hoveredCountry === 'US' || hoveredCountry === 'CA' ? (isDarkMode ? '#22386E' : '#C7DEFA') : (isDarkMode ? '#17254C' : '#D6E6F8')}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                  style={{ transition: 'all 0.2s ease' }}
                />
                {/* Greenland */}
                <path d="M 106 12 C 114 8, 126 12, 124 22 C 118 28, 108 24, 106 18 Z" fill={isDarkMode ? '#17254C' : '#D6E6F8'} stroke={isDarkMode ? '#2D447E' : '#BCD6F6'} strokeWidth="0.8" />

                {/* 2. South America */}
                <path
                  d="M 62 92 C 72 88, 86 92, 92 102 C 98 114, 94 128, 85 142 C 78 154, 70 160, 64 154 C 58 144, 56 130, 56 116 C 56 104, 56 96, 62 92 Z"
                  fill={isDarkMode ? '#17254C' : '#D6E6F8'}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                />

                {/* 3. British Isles (UK & Ireland) */}
                <path
                  d="M 139 32 C 143 30, 147 34, 145 42 C 143 46, 138 46, 136 40 C 135 35, 137 33, 139 32 Z"
                  fill={hoveredCountry === 'GB' ? (isDarkMode ? '#452A12' : '#FED7AA') : (isDarkMode ? '#17254C' : '#D6E6F8')}
                  stroke={hoveredCountry === 'GB' ? '#F59E0B' : (isDarkMode ? '#2D447E' : '#BCD6F6')}
                  strokeWidth={hoveredCountry === 'GB' ? '1.4' : '0.9'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.GB)}
                  onMouseEnter={() => setHoveredCountry('GB')}
                  onMouseLeave={() => setHoveredCountry(null)}
                />

                {/* 4. Continental Europe & Scandinavia */}
                <path
                  d="M 146 26 C 154 18, 166 18, 170 28 C 168 36, 160 38, 156 44 C 164 48, 172 46, 176 52 C 172 58, 160 60, 152 58 C 146 56, 144 48, 146 38 Z"
                  fill={isDarkMode ? '#17254C' : '#D6E6F8'}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                />

                {/* 5. Africa */}
                <path
                  d="M 142 66 C 158 62, 174 64, 178 72 C 184 82, 186 94, 180 106 C 174 122, 164 140, 154 138 C 144 134, 142 118, 138 104 C 132 94, 134 82, 136 74 C 138 68, 140 66, 142 66 Z"
                  fill={isDarkMode ? '#17254C' : '#D6E6F8'}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                />
                {/* Madagascar */}
                <path d="M 188 112 C 192 108, 194 116, 190 126 C 188 128, 186 122, 188 112 Z" fill={isDarkMode ? '#17254C' : '#D6E6F8'} stroke={isDarkMode ? '#2D447E' : '#BCD6F6'} strokeWidth="0.8" />

                {/* 6. Eurasia Mainland (Russia, Central & East Asia) */}
                <path
                  d="M 176 22 C 205 16, 250 18, 285 24 C 292 32, 286 44, 276 48 C 282 56, 280 68, 272 74 C 264 78, 252 74, 246 68 C 238 68, 235 66, 230 66 C 205 66, 188 64, 178 56 C 174 46, 174 32, 176 22 Z"
                  fill={isDarkMode ? '#17254C' : '#D6E6F8'}
                  stroke={isDarkMode ? '#2D447E' : '#BCD6F6'}
                  strokeWidth="0.9"
                />

                {/* 7. THE INDIAN SUBCONTINENT (DISTINCT, PROMINENT, EMERALD-HIGHLIGHTED) */}
                {/* Recognizable triangular peninsula extending down between Arabian Sea and Bay of Bengal */}
                <path
                  id="map-india-land"
                  d="M 204 66 C 196 72, 196 80, 202 86 C 206 92, 212 102, 216 108 C 220 102, 226 92, 230 84 C 234 78, 234 70, 230 66 C 220 65, 212 65, 204 66 Z"
                  fill={hoveredCountry === 'IN' ? (isDarkMode ? '#065F46' : '#A7F3D0') : (isDarkMode ? '#134E4A' : '#C6F6D5')}
                  stroke="#10B981"
                  strokeWidth={hoveredCountry === 'IN' ? '2' : '1.3'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease', filter: hoveredCountry === 'IN' ? 'drop-shadow(0 0 6px #10B981)' : 'none' }}
                  onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.IN)}
                  onMouseEnter={() => setHoveredCountry('IN')}
                  onMouseLeave={() => setHoveredCountry(null)}
                />
                {/* Sri Lanka */}
                <ellipse cx="221" cy="113" rx="2.5" ry="3.5" fill="#10B981" opacity="0.85" />

                {/* 8. Australia */}
                <path
                  d="M 252 118 C 264 112, 282 114, 292 122 C 298 132, 294 146, 284 152 C 272 154, 258 148, 250 140 C 246 132, 248 124, 252 118 Z"
                  fill={hoveredCountry === 'AU' ? (isDarkMode ? '#0E3B43' : '#CFFAFE') : (isDarkMode ? '#17254C' : '#D6E6F8')}
                  stroke={hoveredCountry === 'AU' ? '#06B6D4' : (isDarkMode ? '#2D447E' : '#BCD6F6')}
                  strokeWidth={hoveredCountry === 'AU' ? '1.5' : '0.9'}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.AU)}
                  onMouseEnter={() => setHoveredCountry('AU')}
                  onMouseLeave={() => setHoveredCountry(null)}
                />

                {/* ========================================================
                    INTERACTIVE COUNTRY MARKERS & ANIMATED PULSES
                    ======================================================== */}
                {/* 1. CANADA MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.CA)} onMouseEnter={() => setHoveredCountry('CA')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="60" cy="28" r={hoveredCountry === 'CA' ? 5.5 : 4} fill="#EF4444" />
                  <text x="60" y="22" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={isDarkMode ? '#FCA5A5' : '#B91C1C'}>
                    CAN
                  </text>
                </g>

                {/* 2. UNITED STATES MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.US)} onMouseEnter={() => setHoveredCountry('US')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="64" cy="52" r={hoveredCountry === 'US' ? 6 : 4.5} fill="#168BFF" />
                  <circle cx="64" cy="52" r="9" fill="none" stroke="#168BFF" strokeWidth="1.4" opacity="0.7">
                    <animate attributeName="r" values="4.5;13;4.5" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <text x="64" y="63" textAnchor="middle" fontSize="7" fontWeight="800" fill={isDarkMode ? '#93C5FD' : '#1D4ED8'}>
                    USA
                  </text>
                </g>

                {/* 3. UNITED KINGDOM MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.GB)} onMouseEnter={() => setHoveredCountry('GB')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="140" cy="38" r={hoveredCountry === 'GB' ? 5 : 3.8} fill="#F59E0B" />
                  <text x="140" y="31" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={isDarkMode ? '#FCD34D' : '#B45309'}>
                    UK
                  </text>
                </g>

                {/* 4. INDIA MARKER (CRITICAL - HIGH VISIBILITY & PULSE) */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.IN)} onMouseEnter={() => setHoveredCountry('IN')} onMouseLeave={() => setHoveredCountry(null)}>
                  {/* Glowing outer aura */}
                  <circle cx="216" cy="86" r="16" fill="rgba(16, 185, 129, 0.2)" opacity={hoveredCountry === 'IN' ? '1' : '0.4'} />
                  <circle cx="216" cy="86" r="9" fill="none" stroke="#10B981" strokeWidth="1.6" opacity="0.85">
                    <animate attributeName="r" values="4.5;14;4.5" dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0;0.9" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="216" cy="86" r={hoveredCountry === 'IN' ? 6 : 4.5} fill="#10B981" />
                  {/* CLEAR VISIBLE "INDIA" LABEL */}
                  <text x="216" y="99" textAnchor="middle" fontSize="7.5" fontWeight="900" fill={isDarkMode ? '#6EE7B7' : '#047857'}>
                    INDIA
                  </text>
                </g>

                {/* 5. AUSTRALIA MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.AU)} onMouseEnter={() => setHoveredCountry('AU')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="272" cy="132" r={hoveredCountry === 'AU' ? 5.5 : 4} fill="#06B6D4" />
                  <circle cx="272" cy="132" r="8" fill="none" stroke="#06B6D4" strokeWidth="1.2" opacity="0.6">
                    <animate attributeName="r" values="4;11;4" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                  <text x="272" y="144" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={isDarkMode ? '#67E8F9' : '#0E7490'}>
                    AUS
                  </text>
                </g>

                {/* 6. GLOBAL OTHERS MARKER */}
                <g style={{ cursor: 'pointer' }} onClick={() => setSelectedCountryModal(COMMUNITY_GEO_DATA.OT)} onMouseEnter={() => setHoveredCountry('OT')} onMouseLeave={() => setHoveredCountry(null)}>
                  <circle cx="168" cy="102" r={hoveredCountry === 'OT' ? 4.5 : 3.2} fill="#8B5CF6" />
                </g>
              </svg>

              {/* FLOATING HOVER TOOLTIP */}
              {hoveredCountry && COMMUNITY_GEO_DATA[hoveredCountry] && (() => {
                const c = COMMUNITY_GEO_DATA[hoveredCountry];
                return (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      right: '6px',
                      backgroundColor: isDarkMode ? 'rgba(17, 28, 61, 0.96)' : 'rgba(255, 255, 255, 0.96)',
                      backdropFilter: 'blur(8px)',
                      border: `1.5px solid ${c.color}`,
                      borderRadius: '8px',
                      padding: '7px 10px',
                      boxShadow: `0 6px 16px ${c.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      zIndex: 20,
                      animation: 'fadeIn 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedCountryModal(c)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{c.flag}</span>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: textPrimary, display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{c.country}</span>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: c.color, backgroundColor: `${c.color}18`, padding: '1px 5px', borderRadius: '999px' }}>
                            {c.sharePct}% Share
                          </span>
                        </div>
                        <div style={{ fontSize: '9.5px', color: textSecondary, marginTop: '1px' }}>
                          {formatNumber(c.userCount)} Typists • Avg: <strong>{c.avgWpm} WPM</strong> ({c.avgAccuracy}%)
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: c.color, display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap' }}>
                      <span>Details</span>
                      <span>→</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* COUNTRY BREAKDOWN BARS */}
            <div style={{ width: '175px', display: 'flex', flexDirection: 'column', gap: '7px', flexShrink: 0 }}>
              {Object.values(COMMUNITY_GEO_DATA).map((c) => {
                const isHovered = hoveredCountry === c.code;
                return (
                  <div
                    key={c.code}
                    onMouseEnter={() => setHoveredCountry(c.code)}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => setSelectedCountryModal(c)}
                    title={`Click to view ${c.country} typing community telemetry`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      cursor: 'pointer',
                      padding: '3px 6px',
                      borderRadius: '8px',
                      backgroundColor: isHovered
                        ? isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(22, 139, 255, 0.08)'
                        : 'transparent',
                      border: isHovered ? `1px solid ${c.color}55` : '1px solid transparent',
                      transform: isHovered ? 'translateX(2px)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '13px' }}>{c.flag}</span>
                        <span style={{ color: textPrimary, fontWeight: isHovered ? 800 : 600 }}>{c.country}</span>
                      </div>
                      <span style={{ color: isHovered ? c.color : textSecondary, fontWeight: 700 }}>
                        {c.sharePct}%
                      </span>
                    </div>
                    {/* PROGRESS BAR */}
                    <div style={{ width: '100%', height: '5px', backgroundColor: isDarkMode ? '#1E2C52' : '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${c.sharePct * 2.5}%`,
                          height: '100%',
                          backgroundColor: c.color,
                          borderRadius: '999px',
                          boxShadow: isHovered ? `0 0 8px ${c.color}` : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          INTERACTIVE MODALS & PREVIEWS
          ======================================================== */}

      {/* 1. ACTIVITY DETAILS MODAL */}
      {selectedActivity && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedActivity(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.2)',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#EBF5FF',
                  color: '#168BFF',
                  fontWeight: 900,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selectedActivity.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#15213A' }}>
                    {selectedActivity.user}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Activity Telemetry Details
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                aria-label="Close activity details"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Info grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Action:</span>
                <span style={{ fontWeight: 700, color: '#15213A' }}>{selectedActivity.action}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Timestamp:</span>
                <span style={{ fontWeight: 600, color: '#15213A' }}>{selectedActivity.timeAgo}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Client IP:</span>
                <span style={{ fontFamily: 'monospace', color: '#15213A' }}>192.168.1.104</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Location:</span>
                <span style={{ color: '#15213A' }}>San Francisco, CA (US)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Platform / Browser:</span>
                <span style={{ color: '#15213A' }}>Chrome 130 • Windows 11</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Session Status:</span>
                <span style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Active & Verified
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedActivity(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/admin/users?search=${encodeURIComponent(selectedActivity.user)}`);
                  setSelectedActivity(null);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#168BFF',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(22, 139, 255, 0.3)',
                }}
              >
                <span>View User Profile</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. LESSON DRILLDOWN MODAL */}
      {selectedLesson && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedLesson(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.2)',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#F3E8FF',
                  color: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <GraduationCap size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#15213A' }}>
                    {selectedLesson.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Academy Curriculum Telemetry
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLesson(null)}
                aria-label="Close lesson details"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Total Completions</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#15213A', marginTop: '2px' }}>
                  {formatNumber(selectedLesson.completions)}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Pass Rate</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: selectedLesson.passRate >= 80 ? '#10B981' : '#EF4444', marginTop: '2px' }}>
                  {selectedLesson.passRate}%
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Avg. Speed On Lesson</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#168BFF', marginTop: '2px' }}>
                  56.8 WPM
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Target Accuracy</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#8B5CF6', marginTop: '2px' }}>
                  95.0%
                </div>
              </div>
            </div>

            {/* Curriculum context */}
            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: '#1E40AF', marginBottom: '18px' }}>
              <b>Stage 1: Foundation</b> • Focuses on muscle memory keys for high-frequency english bigrams.
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedLesson(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push('/admin/curriculum');
                  setSelectedLesson(null);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                }}
              >
                <span>Open in Curriculum Editor</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEST TELEMETRY MODAL */}
      {selectedTestDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedTestDetail(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.2)',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#EBF5FF',
                  color: '#168BFF',
                  fontWeight: 900,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {selectedTestDetail.avatar}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#15213A' }}>
                    {selectedTestDetail.user} • Test #{selectedTestDetail.id}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    {selectedTestDetail.date}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTestDetail(null)}
                aria-label="Close telemetry modal"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Speed</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#15213A', marginTop: '2px' }}>{selectedTestDetail.wpm} <span style={{ fontSize: '11px', fontWeight: 600 }}>WPM</span></div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Accuracy</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>{selectedTestDetail.accuracy}%</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Errors</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#EF4444', marginTop: '2px' }}>{selectedTestDetail.errors}</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Duration</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#8B5CF6', marginTop: '2px' }}>{selectedTestDetail.duration}</div>
              </div>
            </div>

            {/* Keystroke Diagnostics */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px', fontSize: '12px', marginBottom: '18px' }}>
              <div style={{ fontWeight: 700, color: '#15213A', marginBottom: '6px' }}>Telemetry Diagnostics:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#64748B' }}>
                <div>• Mode: <b>{selectedTestDetail.testType}</b></div>
                <div>• Total Keystrokes: <b>{Math.round(selectedTestDetail.wpm * 5 * 1.1)} strokes</b></div>
                <div>• Consistency Rating: <b style={{ color: '#10B981' }}>94.8% (Smooth flow)</b></div>
                <div>• Verification Engine: <b>Anti-Cheat Certified • Keystroke Interval Valid</b></div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedTestDetail(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CERTIFICATE PREVIEW MODAL */}
      {selectedCertificate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedCertificate(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 32px 64px rgba(15, 23, 42, 0.25)',
              border: '2px solid #E2E8F0',
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedCertificate(null)}
              aria-label="Close certificate preview"
              style={{ position: 'absolute', right: '18px', top: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
            >
              <X size={20} />
            </button>

            {/* Certificate Header Badge */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
            }}>
              <Award size={32} />
            </div>

            <div style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Official Typing Typhon Certification
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#15213A', margin: '4px 0 16px 0' }}>
              Certificate of Typing Speed
            </h2>

            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              This certifies that <b style={{ color: '#15213A' }}>{selectedCertificate.user}</b> has successfully completed the Typing Typhon speed assessment:
            </p>

            {/* Badge display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              padding: '16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              margin: '0 0 20px 0',
            }}>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#168BFF' }}>
                  {selectedCertificate.wpm}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>WORDS PER MINUTE</div>
              </div>
              <div style={{ width: '1px', height: '36px', backgroundColor: '#CBD5E1' }} />
              <div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#10B981' }}>
                  {selectedCertificate.accuracy}%
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>ACCURACY RATE</div>
              </div>
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '24px' }}>
              Issued On: {selectedCertificate.date} • Verification ID: #TT-CERT-{selectedCertificate.id}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setSelectedCertificate(null)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                style={{
                  padding: '9px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#0072FF',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 114, 255, 0.35)',
                }}
              >
                <Printer size={15} />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. COUNTRY COMMUNITY TELEMETRY MODAL */}
      {selectedCountryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedCountryModal(null)}
        >
          <div
            style={{
              backgroundColor: surfaceBg,
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.25)',
              border: `1px solid ${surfaceBorder}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px' }}>{selectedCountryModal.flag}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 900, color: textPrimary, margin: 0 }}>
                      {selectedCountryModal.country}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: selectedCountryModal.color,
                      backgroundColor: `${selectedCountryModal.color}18`,
                      padding: '2px 8px',
                      borderRadius: '999px',
                    }}>
                      {selectedCountryModal.code} • {selectedCountryModal.sharePct}% Global
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
                    Region: {selectedCountryModal.region} • Ranked #{selectedCountryModal.code === 'US' ? '1' : selectedCountryModal.code === 'IN' ? '2' : selectedCountryModal.code === 'GB' ? '3' : selectedCountryModal.code === 'CA' ? '4' : '5'} by active community size
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCountryModal(null)}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: textMuted,
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 4 Metric Pods */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '18px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: surfaceSubtle, border: `1px solid ${surfaceBorder}` }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Active Typists</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: textPrimary, marginTop: '2px' }}>
                  {formatNumber(selectedCountryModal.userCount)}
                </div>
                <div style={{ fontSize: '11px', color: selectedCountryModal.color, fontWeight: 700, marginTop: '2px' }}>
                  {selectedCountryModal.sharePct}% of total platform
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: surfaceSubtle, border: `1px solid ${surfaceBorder}` }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Average Speed</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: textPrimary, marginTop: '2px' }}>
                  {selectedCountryModal.avgWpm} <span style={{ fontSize: '13px', fontWeight: 600 }}>WPM</span>
                </div>
                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                  {selectedCountryModal.avgAccuracy}% accuracy rate
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: surfaceSubtle, border: `1px solid ${surfaceBorder}` }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Tests Completed</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: textPrimary, marginTop: '2px' }}>
                  {formatNumber(selectedCountryModal.testsCompleted)}
                </div>
                <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>
                  Over {formatNumber(selectedCountryModal.practiceHours)} practice hours
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: surfaceSubtle, border: `1px solid ${surfaceBorder}` }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: textSecondary, textTransform: 'uppercase' }}>Preferred Keyboard</div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: textPrimary, marginTop: '5px' }}>
                  QWERTY
                </div>
                <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>
                  ANSI Standard 104-key
                </div>
              </div>
            </div>

            {/* Top Regional Hubs */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: textSecondary, marginBottom: '8px' }}>
                Major Typist Hubs & Metros:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedCountryModal.topCities.map((city) => (
                  <span
                    key={city}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: textPrimary,
                      backgroundColor: surfaceSubtle,
                      border: `1px solid ${surfaceBorder}`,
                      borderRadius: '8px',
                      padding: '4px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <MapPin size={11} color={selectedCountryModal.color} />
                    <span>{city}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedCountryModal(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: `1px solid ${surfaceBorder}`,
                  backgroundColor: surfaceSubtle,
                  color: textPrimary,
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCountryModal(null);
                  router.push(`/admin/users?search=${encodeURIComponent(selectedCountryModal.country)}`);
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: selectedCountryModal.color,
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: `0 4px 12px ${selectedCountryModal.color}40`,
                }}
              >
                <Users size={14} />
                <span>Inspect {selectedCountryModal.country} Users</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ALL GLOBAL COUNTRIES LEADERBOARD MODAL */}
      {showAllCountriesModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowAllCountriesModal(false)}
        >
          <div
            style={{
              backgroundColor: surfaceBg,
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.25)',
              border: `1px solid ${surfaceBorder}`,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  backgroundColor: isDarkMode ? '#281E48' : '#F3E8FF',
                  color: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Globe2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: textPrimary, margin: 0 }}>
                    Global Community Distribution
                  </h3>
                  <div style={{ fontSize: '11.5px', color: textSecondary, marginTop: '2px' }}>
                    Ranked geographic breakdown across 12,458 registered typists worldwide
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllCountriesModal(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: textMuted,
                  borderRadius: '6px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={14} color={textMuted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={countrySearchQuery}
                onChange={(e) => setCountrySearchQuery(e.target.value)}
                placeholder="Search countries, regions, codes..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '8px',
                  border: `1px solid ${surfaceBorder}`,
                  backgroundColor: surfaceSubtle,
                  color: textPrimary,
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: `1px solid ${surfaceBorder}`, borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: surfaceSubtle, borderBottom: `1px solid ${surfaceBorder}` }}>
                    <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: textSecondary }}>Rank</th>
                    <th style={{ padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: textSecondary }}>Country</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: textSecondary }}>Typists</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: textSecondary }}>Global Share</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: textSecondary }}>Avg Speed</th>
                    <th style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: textSecondary }}>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_GLOBAL_COUNTRIES
                    .filter((c) =>
                      c.country.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
                      c.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
                    )
                    .map((c) => (
                      <tr
                        key={c.code}
                        onClick={() => {
                          const geo = COMMUNITY_GEO_DATA[c.code] || {
                            country: c.country,
                            code: c.code,
                            flag: c.flag,
                            sharePct: c.sharePct,
                            color: c.color,
                            userCount: c.users,
                            avgWpm: c.avgWpm,
                            avgAccuracy: c.accuracy,
                            testsCompleted: c.users * 95,
                            practiceHours: Math.round(c.users * 1.3),
                            topCities: [c.country],
                            cx: 160,
                            cy: 80,
                            region: 'Global',
                          };
                          setShowAllCountriesModal(false);
                          setSelectedCountryModal(geo);
                        }}
                        style={{
                          borderBottom: `1px solid ${surfaceBorder}`,
                          cursor: 'pointer',
                          transition: 'background-color 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDarkMode ? '#16244D' : '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: textMuted }}>#{c.rank}</td>
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: textPrimary }}>
                          <span style={{ marginRight: '6px' }}>{c.flag}</span>
                          <span>{c.country}</span>
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: textPrimary }}>
                          {formatNumber(c.users)}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: c.color }}>
                          {c.sharePct}%
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: textPrimary }}>
                          {c.avgWpm} WPM
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color: '#10B981' }}>
                          {c.accuracy}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setShowAllCountriesModal(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: `1px solid ${surfaceBorder}`,
                  backgroundColor: surfaceSubtle,
                  color: textPrimary,
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
