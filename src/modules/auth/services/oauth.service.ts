import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';

@Injectable()
export class OAuthService {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async validateGoogleUser(profile: any) {
    const { emails, displayName, photos } = profile;
    const email = emails[0].value;
    const username = displayName.toLowerCase().replace(/\s+/g, '_');
    const picture = photos[0].value;

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      const createUserDto: CreateUserDto = {
        email,
        username,
        password: Math.random().toString(36).slice(-8), // Generate random password
        oauthProvider: 'google',
        oauthId: profile.id,
      };
      user = await this.usersService.create(createUserDto);
    }

    return user;
  }

  async validateGitHubUser(profile: any) {
    const { emails, displayName, photos } = profile;
    const email = emails[0].value;
    const username = displayName.toLowerCase().replace(/\s+/g, '_');
    const picture = photos[0].value;

    let user = await this.usersService.findByEmail(email);
    if (!user) {
      const createUserDto: CreateUserDto = {
        email,
        username,
        password: Math.random().toString(36).slice(-8), // Generate random password
        oauthProvider: 'github',
        oauthId: profile.id,
      };
      user = await this.usersService.create(createUserDto);
    }

    return user;
  }
} 