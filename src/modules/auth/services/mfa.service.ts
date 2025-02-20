import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { RedisService } from '../../../database/redis.service';

@Injectable()
export class MfaService {
  constructor(private readonly redisService: RedisService) {}

  async generateSecret(userId: string): Promise<string> {
    const secret = authenticator.generateSecret();
    await this.redisService.set(`mfa:${userId}`, secret, 300); // 5 minutes expiry
    return secret;
  }

  async verifyCode(userId: string, code: string): Promise<boolean> {
    const secret = await this.redisService.get(`mfa:${userId}`);
    if (!secret) return false;
    return authenticator.verify({ token: code, secret });
  }

  async disableMfa(userId: string): Promise<void> {
    await this.redisService.del(`mfa:${userId}`);
  }
} 