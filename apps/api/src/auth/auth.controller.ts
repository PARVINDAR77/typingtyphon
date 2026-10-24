import { Controller, Post, Get, Body, Res, Req, UseGuards, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(
    @Body() body: { idToken?: string; credential?: string; token?: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const token = body.idToken || body.credential || body.token;
    if (!token) {
      throw new UnauthorizedException('Google ID token or credential is required.');
    }
    const result = await this.authService.socialLoginGoogle(token);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return {
      success: true,
      user: result.user,
    };
  }

  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  async facebookAuth(
    @Body() body: { accessToken?: string; token?: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const token = body.accessToken || body.token;
    if (!token) {
      throw new UnauthorizedException('Facebook access token is required.');
    }
    const result = await this.authService.socialLoginFacebook(token);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return {
      success: true,
      user: result.user,
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return {
      success: true,
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return {
      success: true,
      user: result.user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as any).cookies?.refresh_token || (req as any).headers?.authorization?.replace('Bearer ', '');
    const result = await this.authService.refreshTokens(refreshToken);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return {
      success: true,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const token = (req as any).cookies?.access_token || (req as any).headers?.authorization?.replace('Bearer ', '');
    if (token) {
      const payload = this.authService.verifyToken(token);
      if (payload?.sub) {
        await this.authService.revokeUserTokens(payload.sub);
      }
    }
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', secure: isProduction, path: '/' });
    res.clearCookie('refresh_token', { httpOnly: true, sameSite: 'lax', secure: isProduction, path: '/' });
    return {
      success: true,
      message: 'Successfully logged out.',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const user = await this.authService.getUserProfile(req.user.id);
    return {
      success: true,
      user,
    };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }
}

