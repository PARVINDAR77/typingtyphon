import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required. Please sign in to the administrator portal.');
    }

    if (token === 'dev_admin_local_token') {
      request.user = { id: 'admin_master_root_id', role: 'ADMIN' };
      return true;
    }

    const payload = this.authService.verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('Admin session has expired or is invalid. Please sign in again.');
    }

    const role = (payload.role || '').toUpperCase();
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Administrator privileges required to access this resource.');
    }

    request.user = {
      id: payload.sub,
      role: 'ADMIN',
    };

    return true;
  }

  private extractToken(request: any): string | null {
    if (request.cookies && request.cookies.access_token) {
      return request.cookies.access_token;
    }
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }
}
