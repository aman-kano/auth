import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('app.nodeEnv');
  }

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  get jwtExpiration(): string {
    return this.configService.get<string>('JWT_EXPIRATION');
  }

  get jwtRefreshExpiration(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRATION');
  }

  get redisConfig() {
    return {
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
    };
  }

  get rateLimitConfig() {
    return {
      ttl: this.configService.get<number>('app.rateLimit.ttl'),
      limit: this.configService.get<number>('app.rateLimit.limit'),
    };
  }

  get mfaConfig() {
    return {
      issuer: this.configService.get<string>('app.mfa.issuer'),
    };
  }

  get smtpConfig() {
    return {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      user: this.configService.get<string>('SMTP_USER'),
      pass: this.configService.get<string>('SMTP_PASS'),
      from: this.configService.get<string>('SMTP_FROM'),
    };
  }

  get oauthConfig() {
    return {
      google: {
        clientId: this.configService.get<string>('app.oauth.google.clientId'),
        clientSecret: this.configService.get<string>('app.oauth.google.clientSecret'),
      },
      github: {
        clientId: this.configService.get<string>('app.oauth.github.clientId'),
        clientSecret: this.configService.get<string>('app.oauth.github.clientSecret'),
      },
    };
  }
}
