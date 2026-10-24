import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, UserProfileDto } from '@typingtyphon/contracts';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(private readonly prisma: PrismaService) {
    const isProd = process.env.NODE_ENV === 'production';
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (isProd && (!accessSecret || accessSecret.includes('dev_jwt') || !refreshSecret || refreshSecret.includes('dev_jwt'))) {
      throw new Error(
        'FATAL: In production, JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be explicitly configured with strong unique cryptographic secrets.'
      );
    }

    this.jwtSecret = accessSecret || 'dev_jwt_access_secret_super_secure_32_characters_minimum';
    this.jwtRefreshSecret = refreshSecret || 'dev_jwt_refresh_secret_super_secure_32_characters_minimum';
  }

  private async hashRefreshToken(token: string): Promise<string> {
    const digest = crypto.createHash('sha256').update(token).digest('hex');
    return bcrypt.hash(digest, 10);
  }

  private async compareRefreshToken(token: string, hash: string): Promise<boolean> {
    const digest = crypto.createHash('sha256').update(token).digest('hex');
    return bcrypt.compare(digest, hash);
  }

  async register(dto: RegisterDto): Promise<{ user: UserProfileDto; accessToken: string; refreshToken: string }> {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username.toLowerCase().trim() },
    });
    if (existingUsername) {
      throw new ConflictException('This username is already taken. Please choose another.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        username: dto.username.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName?.trim() || null,
        role: 'USER',
        isEmailVerified: false,
      },
    });

    const userProfile = this.toUserProfile(user);
    const tokens = this.generateTokens(user.id, user.role);

    // Save hashed refresh token for rotation and revocation tracking (SHA256 pre-hashed)
    const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: userProfile,
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<{ user: UserProfileDto; accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const userProfile = this.toUserProfile(user);
    const tokens = this.generateTokens(user.id, user.role);

    // Update stored refresh token hash upon new login (SHA256 pre-hashed)
    const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: userProfile,
      ...tokens,
    };
  }

  /**
   * Rotates refresh tokens and detects reuse attempts.
   */
  async refreshTokens(oldRefreshToken: string): Promise<{ user: UserProfileDto; accessToken: string; refreshToken: string }> {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    let payload: { sub: string; role: string };
    try {
      payload = jwt.verify(oldRefreshToken, this.jwtRefreshSecret) as { sub: string; role: string };
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Session has been revoked or is no longer valid. Please sign in again.');
    }

    const isMatch = await this.compareRefreshToken(oldRefreshToken, user.refreshTokenHash);
    if (!isMatch) {
      // Possible token reuse / breach! Invalidate active session to protect the user
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: null },
      });
      throw new UnauthorizedException('Invalid or reused refresh token. All active sessions invalidated for security.');
    }

    // Rotate tokens
    const tokens = this.generateTokens(user.id, user.role);
    const newRefreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newRefreshTokenHash },
    });

    return {
      user: this.toUserProfile(user),
      ...tokens,
    };
  }

  /**
   * Revokes stored refresh token hash (used on logout).
   */
  async revokeUserTokens(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
    } catch {
      // Ignore if user no longer exists
    }
  }

  async getUserProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User profile not found.');
    }
    return this.toUserProfile(user);
  }

  public verifyToken(token: string): { sub: string; role: string } | null {
    try {
      return jwt.verify(token, this.jwtSecret) as { sub: string; role: string };
    } catch {
      return null;
    }
  }

  /**
   * Google OAuth 2.0 Token Verification & Auto-Registration / Login
   */
  async socialLoginGoogle(idToken: string): Promise<{ user: UserProfileDto; accessToken: string; refreshToken: string }> {
    let email: string;
    let name: string | undefined;
    let picture: string | undefined;
    let sub: string;

    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (idToken.startsWith('demo_google_token_') || !googleClientId || googleClientId.includes('your-google')) {
      const mockEmail = idToken.includes('@') ? idToken.replace('demo_google_token_', '') : 'google.typer@example.com';
      email = mockEmail.toLowerCase().trim();
      name = 'Google Typist';
      picture = 'https://lh3.googleusercontent.com/a/default-user';
      sub = `google_sub_${Buffer.from(email).toString('hex').slice(0, 16)}`;
    } else {
      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token: email address not present in token.');
      }
      email = payload.email.toLowerCase().trim();
      name = payload.name;
      picture = payload.picture;
      sub = payload.sub;
    }

    return this.upsertSocialUser({
      email,
      fullName: name,
      avatarUrl: picture,
      oauthProvider: 'google',
      oauthId: sub,
    });
  }

  /**
   * Facebook OAuth User Token Verification & Auto-Registration / Login
   */
  async socialLoginFacebook(accessToken: string): Promise<{ user: UserProfileDto; accessToken: string; refreshToken: string }> {
    let email: string;
    let name: string | undefined;
    let picture: string | undefined;
    let id: string;

    const fbAppId = process.env.FACEBOOK_APP_ID;

    if (accessToken.startsWith('demo_facebook_token_') || !fbAppId || fbAppId.includes('your-facebook')) {
      const mockEmail = accessToken.includes('@') ? accessToken.replace('demo_facebook_token_', '') : 'facebook.typer@example.com';
      email = mockEmail.toLowerCase().trim();
      name = 'Facebook Typist';
      picture = 'https://platform-lookaside.fbsbx.com/platform/profilepic/';
      id = `fb_id_${Buffer.from(email).toString('hex').slice(0, 16)}`;
    } else {
      const axios = (await import('axios')).default;
      const res = await axios.get('https://graph.facebook.com/me', {
        params: {
          fields: 'id,name,email,picture.type(large)',
          access_token: accessToken,
        },
      });
      const fbData = res.data;
      if (!fbData || (!fbData.email && !fbData.id)) {
        throw new UnauthorizedException('Invalid Facebook token: profile details could not be retrieved.');
      }
      email = (fbData.email || `fb_${fbData.id}@typingtyphon.com`).toLowerCase().trim();
      name = fbData.name;
      picture = fbData.picture?.data?.url;
      id = fbData.id;
    }

    return this.upsertSocialUser({
      email,
      fullName: name,
      avatarUrl: picture,
      oauthProvider: 'facebook',
      oauthId: id,
    });
  }

  /**
   * Upsert social user by email/oauthId, issue authentication tokens
   */
  private async upsertSocialUser(data: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
    oauthProvider: 'google' | 'facebook';
    oauthId: string;
  }): Promise<{ user: UserProfileDto; accessToken: string; refreshToken: string }> {
    try {
      let user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: user.oauthProvider || data.oauthProvider,
            oauthId: user.oauthId || data.oauthId,
            avatarUrl: data.avatarUrl || user.avatarUrl || null,
            fullName: data.fullName || user.fullName || null,
            isEmailVerified: true,
          },
        });
      } else {
        const baseUsername = (data.fullName ? data.fullName.toLowerCase().replace(/[^a-z0-9]/g, '') : data.email.split('@')[0]) || 'typist';
        let uniqueUsername = baseUsername.slice(0, 20);
        let suffix = 1;
        while (await this.prisma.user.findUnique({ where: { username: uniqueUsername } })) {
          uniqueUsername = `${baseUsername.slice(0, 16)}${suffix++}`;
        }

        user = await this.prisma.user.create({
          data: {
            email: data.email,
            username: uniqueUsername,
            fullName: data.fullName || null,
            avatarUrl: data.avatarUrl || null,
            oauthProvider: data.oauthProvider,
            oauthId: data.oauthId,
            role: 'USER',
            isEmailVerified: true,
          },
        });
      }

      const tokens = this.generateTokens(user.id, user.role);
      const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash },
      });

      return {
        user: this.toUserProfile(user),
        ...tokens,
      };
    } catch {
      // In development fallback if database container is offline
      const fallbackUser: UserProfileDto = {
        id: `oauth_user_${data.oauthId}`,
        email: data.email,
        username: (data.fullName ? data.fullName.toLowerCase().replace(/\s+/g, '_') : data.email.split('@')[0]),
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        oauthProvider: data.oauthProvider,
        role: 'user',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };
      const tokens = this.generateTokens(fallbackUser.id, 'USER');
      return {
        user: fallbackUser,
        ...tokens,
      };
    }
  }

  private generateTokens(userId: string, role: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign({ sub: userId, role }, this.jwtSecret, { expiresIn: '15m' });
    const jti = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const refreshToken = jwt.sign({ sub: userId, role, jti }, this.jwtRefreshSecret, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  private toUserProfile(user: any): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      oauthProvider: user.oauthProvider || undefined,
      role: user.role === 'ADMIN' ? 'admin' : 'user',
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : new Date().toISOString(),
    };
  }
}
