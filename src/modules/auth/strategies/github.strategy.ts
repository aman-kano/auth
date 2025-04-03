import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { AppConfigService } from '../../../config/config.service';
import { OAuthService } from '../oauth/oauth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: AppConfigService,
    private readonly oauthService: OAuthService,
  ) {
    super({
      clientID: configService.oauthConfig.github.clientId,
      clientSecret: configService.oauthConfig.github.clientSecret,
      callbackURL: `${configService.baseUrl}/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    return this.oauthService.validateGitHubUser(profile);
  }
} 