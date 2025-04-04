import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AppConfigService } from '../../../config/config.service';
import { OAuthService } from '../oauth/oauth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: AppConfigService,
    private readonly oauthService: OAuthService,
  ) {
    super({
      clientID: configService.oauthConfig.google.clientId,
      clientSecret: configService.oauthConfig.google.clientSecret,
      callbackURL: `${configService.baseUrl}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await this.oauthService.validateGoogleUser(profile);
    done(null, user);
  }
} 