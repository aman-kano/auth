import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { PrismaService } from '../../../database/prisma.service';
import { AuthService } from '../auth.service';
import { UserRole } from '../types/role.enum';

@Injectable()
export class OAuthService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async validateGoogleUser(profile: any) {
    const { emails, displayName, id } = profile;
    const email = emails[0].value;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        oauthAccounts: true,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username: displayName,
          passwordHash: '', // OAuth users don't need password
          roles: {
            connect: { name: UserRole.DRONE_OPERATOR }
          },
          oauthAccounts: {
            create: {
              provider: 'google',
              providerId: id,
            },
          },
        },
        include: {
          oauthAccounts: true,
        },
      });
    } else if (!user.oauthAccounts.some(acc => acc.provider === 'google')) {
      await this.prisma.oAuthAccount.create({
        data: {
          provider: 'google',
          providerId: id,
          userId: user.id,
        },
      });
    }

    return user;
  }

  async validateGitHubUser(profile: any) {
    const { emails, username, id } = profile;
    const email = emails[0].value;

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        oauthAccounts: true,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          username,
          passwordHash: '', // OAuth users don't need password
          roles: {
            connect: { name: UserRole.DRONE_OPERATOR }
          },
          oauthAccounts: {
            create: {
              provider: 'github',
              providerId: id,
            },
          },
        },
        include: {
          oauthAccounts: true,
        },
      });
    } else if (!user.oauthAccounts.some(acc => acc.provider === 'github')) {
      await this.prisma.oAuthAccount.create({
        data: {
          provider: 'github',
          providerId: id,
          userId: user.id,
        },
      });
    }

    return user;
  }
} 