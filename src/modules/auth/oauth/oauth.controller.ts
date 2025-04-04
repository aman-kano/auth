import { Controller, Get, UseGuards, Req, Inject, forwardRef } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Controller('auth')
export class OAuthController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This endpoint initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request) {
    const user = req.user as any;
    const tokens = await this.authService.generateTokens(user);
    return { user, ...tokens };
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // This endpoint initiates GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: Request) {
    const user = req.user as any;
    const tokens = await this.authService.generateTokens(user);
    return { user, ...tokens };
  }
} 