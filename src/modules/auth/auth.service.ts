import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from './services/email.service';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { UserRole } from './types/role.enum';

interface OAuthUser {
  email: string;
  username: string;
  provider: string;
  id: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: registerDto.email },
          { username: registerDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await argon2.hash(registerDto.password);
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email,
        passwordHash,
        roles: {
          connect: (registerDto.roles || [UserRole.DRONE_OPERATOR]).map(role => ({ name: role }))
        }
      },
    });

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mfaEnabled) {
      return { mfaRequired: true, userId: user.id };
    }

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async verifyMfa(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { mfaSecrets: true },
    });

    if (!user || !user.mfaEnabled) {
      throw new UnauthorizedException('Invalid MFA request');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async setupMfa(userId: string) {
    const secret = authenticator.generateSecret();
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret,
        mfaEnabled: true,
      },
    });

    const otpauthUrl = authenticator.keyuri(
      user.email,
      'DroneManagement',
      secret,
    );

    return { secret, otpauthUrl };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp,
      },
    });

    await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: resetPasswordDto.token,
        resetTokenExp: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(resetPasswordDto.password);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async findOrCreateOAuthUser(oauthUser: OAuthUser) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: oauthUser.email },
    });

    if (existingUser) {
      const tokens = await this.generateTokens(existingUser);
      return { user: existingUser, ...tokens };
    }

    const passwordHash = await argon2.hash(randomBytes(32).toString('hex'));
    const user = await this.prisma.user.create({
      data: {
        email: oauthUser.email,
        username: oauthUser.username,
        passwordHash,
        roles: {
          connect: [{ name: UserRole.DRONE_OPERATOR }]
        }
      },
    });

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
