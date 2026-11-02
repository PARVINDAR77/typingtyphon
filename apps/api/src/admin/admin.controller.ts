import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Ip,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { LoginDto } from '@typingtyphon/contracts';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Admin Authentication
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminService.authenticateAdmin(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return {
      success: true,
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', secure: isProduction, path: '/' });
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'lax', secure: isProduction, path: '/' });
    return {
      success: true,
      message: 'Administrator session closed successfully.',
    };
  }

  @Get('auth/me')
  @UseGuards(AdminGuard)
  async getAdminProfile(@Req() req: any) {
    return {
      success: true,
      user: {
        id: req.user.id,
        role: req.user.role,
        fullName: 'Administrator',
        email: 'admin@typingtyphon.com',
      },
    };
  }

  /**
   * Executive Dashboard Data
   */
  @Get('dashboard')
  @UseGuards(AdminGuard)
  async getDashboard(@Query('period') period?: string) {
    const data = await this.adminService.getDashboardData(period || '30d');
    return {
      success: true,
      data,
    };
  }

  /**
   * User Management
   */
  @Get('users')
  @UseGuards(AdminGuard)
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.adminService.getUsers({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      role,
      status,
    });
    return {
      success: true,
      data,
    };
  }

  @Get('users/:id')
  @UseGuards(AdminGuard)
  async getUserDetail(@Param('id') id: string) {
    const data = await this.adminService.getUserDetail(id);
    return {
      success: true,
      data,
    };
  }

  @Patch('users/:id/status')
  @UseGuards(AdminGuard)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const result = await this.adminService.updateUserStatus(
      id,
      body.status,
      body.reason || 'Admin status mutation',
      req.user,
      ip,
    );
    return result;
  }

  /**
   * Curriculum Management
   */
  @Get('curriculum/stages')
  @UseGuards(AdminGuard)
  async getCurriculumStages() {
    const stages = await this.adminService.getCurriculumStages();
    return {
      success: true,
      data: stages,
    };
  }

  @Patch('curriculum/lessons/:id')
  @UseGuards(AdminGuard)
  async updateLessonThreshold(
    @Param('id') lessonId: string,
    @Body() body: { minAccuracyPct: number; minWpm: number },
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const result = await this.adminService.updateLessonThreshold(
      lessonId,
      body,
      req.user,
      ip,
    );
    return result;
  }

  /**
   * Reports & Data Exports
   */
  @Get('reports')
  @UseGuards(AdminGuard)
  async getReports(
    @Query('type') type?: string,
    @Query('dateRange') dateRange?: string,
    @Query('exportFormat') exportFormat?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const data = await this.adminService.getReports(type || 'usage', dateRange || '30d');

    if (exportFormat === 'csv' && res) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="typingtyphon-report-${type || 'usage'}-${Date.now()}.csv"`,
      );

      // Sanitize fields against CSV Formula Injection (=, +, -, @)
      const sanitize = (val: any) => {
        let str = String(val ?? '');
        if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
          str = `'` + str;
        }
        return `"${str.replace(/"/g, '""')}"`;
      };

      const headers = ['ID', 'Name', 'Email', 'Type', 'Tests Count', 'Avg WPM', 'Status'];
      const rows = data.records.map((r) =>
        [r.id, r.name, r.email, r.type, r.testsCount, r.avgWpm, r.status].map(sanitize).join(','),
      );

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      return csvContent;
    }

    return {
      success: true,
      data,
    };
  }

  /**
   * Platform Health & Monitoring
   */
  @Get('system/health')
  @UseGuards(AdminGuard)
  async getSystemHealth() {
    const health = await this.adminService.getSystemHealth();
    return {
      success: true,
      data: health,
    };
  }

  /**
   * Audit Logs
   */
  @Get('audit-logs')
  @UseGuards(AdminGuard)
  async getAuditLogs() {
    const logs = await this.adminService.getAuditLogs();
    return {
      success: true,
      data: logs,
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}
