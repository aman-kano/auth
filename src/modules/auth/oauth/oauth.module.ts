import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { GoogleStrategy } from '../strategies/google.strategy';
import { GitHubStrategy } from '../strategies/github.strategy';
import { AuthModule } from '../auth.module';
import { PrismaModule } from '../../../database/prisma.module';
import { ConfigModule } from '../../../config/config.module';

@Module({
  imports: [
    PassportModule,
    PrismaModule,
    forwardRef(() => AuthModule),
    ConfigModule,
  ],
  controllers: [OAuthController],
  providers: [OAuthService, GoogleStrategy, GitHubStrategy],
  exports: [OAuthService],
})
export class OAuthModule {} 