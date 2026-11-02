import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from './admin.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;

  const mockPrismaService: any = {
    user: {
      count: vi.fn().mockResolvedValue(3861),
      findUnique: vi.fn(),
    },
    typingSession: {
      count: vi.fn().mockResolvedValue(1238450),
      aggregate: vi.fn().mockResolvedValue({
        _avg: { netWpm: 52.3, accuracyPct: 96.5 },
      }),
    },
  };

  const mockAuthService: any = {
    generateTokens: vi.fn().mockReturnValue({
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
    }),
    toUserProfile: vi.fn().mockImplementation((u: any) => ({
      id: u.id,
      email: u.email,
      role: u.role,
    })),
  };

  beforeEach(() => {
    service = new AdminService(mockPrismaService, mockAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('authenticateAdmin', () => {
    it('authenticates built-in root administrator', async () => {
      const result = await service.authenticateAdmin({
        email: 'admin@typingtyphon.com',
        password: 'Admin@Typhon2026!',
      });
      expect(result.user.email).toBe('admin@typingtyphon.com');
      expect(result.accessToken).toBe('mock_access_token');
    });

    it('rejects invalid password', async () => {
      await expect(
        service.authenticateAdmin({
          email: 'admin@typingtyphon.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getDashboardData', () => {
    it('returns executive telemetry matching reference specification', async () => {
      const data = await service.getDashboardData('30d');
      expect(data.kpis.totalUsers.value).toBe(12458);
      expect(data.kpis.activeUsers.value).toBe(842);
      expect(data.kpis.testsCompleted.value).toBe(1238450);
      expect(data.kpis.avgWpm.value).toBe(52.3);
      expect(data.userGrowth.length).toBeGreaterThan(0);
      expect(data.userDistribution.guests.pct).toBe(62);
      expect(data.recentActivity.length).toBeGreaterThan(0);
      expect(data.topLessons.length).toBeGreaterThan(0);
      expect(data.platformHealth.status).toBe('All Systems Operational');
    });
  });

  describe('getUsers', () => {
    it('filters and paginates users list', async () => {
      const res = await service.getUsers({ page: 1, limit: 5 });
      expect(res.users.length).toBe(5);
      expect(res.meta.page).toBe(1);
      expect(res.summary.totalUsers).toBe(12458);
    });

    it('filters by status and search keyword', async () => {
      const res = await service.getUsers({ search: 'Alex', status: 'Active' });
      expect(res.users.length).toBe(1);
      expect(res.users[0].name).toBe('Alex Johnson');
    });
  });

  describe('updateUserStatus & Audit Logging', () => {
    it('records immutable audit log upon status mutation', async () => {
      const res = await service.updateUserStatus(
        'usr-1',
        'Suspended',
        'Security investigation',
        { id: 'admin-super', fullName: 'Super Admin' },
        '192.168.1.1',
      );
      expect(res.success).toBe(true);
      expect(res.user.status).toBe('Suspended');

      const logs = await service.getAuditLogs();
      expect(logs[0].actionType).toBe('USER_STATUS_UPDATED');
      expect(logs[0].targetId).toBe('usr-1');
    });
  });
});
