import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminGuard } from './admin.guard';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      verifyToken: vi.fn(),
    };
    guard = new AdminGuard(mockAuthService);
  });

  const createMockContext = (headers: any = {}, cookies: any = {}) => {
    const request = {
      headers,
      cookies,
      user: null as any,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      request,
    };
  };

  it('rejects requests with missing token', () => {
    const { switchToHttp } = createMockContext();
    expect(() => guard.canActivate({ switchToHttp } as any)).toThrow(UnauthorizedException);
  });

  it('rejects requests with invalid or expired token', () => {
    const { switchToHttp } = createMockContext({ authorization: 'Bearer bad_token' });
    mockAuthService.verifyToken.mockReturnValue(null);
    expect(() => guard.canActivate({ switchToHttp } as any)).toThrow(UnauthorizedException);
  });

  it('rejects users with non-ADMIN role (e.g. USER)', () => {
    const { switchToHttp } = createMockContext({ authorization: 'Bearer user_token' });
    mockAuthService.verifyToken.mockReturnValue({ sub: 'user_123', role: 'USER' });
    expect(() => guard.canActivate({ switchToHttp } as any)).toThrow(ForbiddenException);
  });

  it('allows access for users with ADMIN role and sets request.user', () => {
    const mockCtx = createMockContext({ authorization: 'Bearer admin_token' });
    mockAuthService.verifyToken.mockReturnValue({ sub: 'admin_123', role: 'ADMIN' });

    const result = guard.canActivate(mockCtx as any);
    expect(result).toBe(true);
    expect(mockCtx.request.user).toEqual({
      id: 'admin_123',
      role: 'ADMIN',
    });
  });

  it('extracts token from HttpOnly cookies', () => {
    const mockCtx = createMockContext({}, { access_token: 'cookie_token' });
    mockAuthService.verifyToken.mockReturnValue({ sub: 'admin_456', role: 'ADMIN' });

    const result = guard.canActivate(mockCtx as any);
    expect(result).toBe(true);
    expect(mockCtx.request.user.id).toBe('admin_456');
  });
});
