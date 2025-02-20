import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../auth/types/role.enum';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await argon2.hash(createUserDto.password);
    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash,
        roles: {
          connect: (createUserDto.roles || [UserRole.DRONE_OPERATOR]).map(role => ({ name: role }))
        },
        oauthAccounts: createUserDto.oauthProvider && createUserDto.oauthId ? {
          create: {
            provider: createUserDto.oauthProvider,
            providerId: createUserDto.oauthId,
          },
        } : undefined,
      },
      include: {
        mfaSecrets: true,
        oauthAccounts: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        mfaSecrets: true,
        oauthAccounts: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        mfaSecrets: true,
        oauthAccounts: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.passwordHash = await argon2.hash(updateUserDto.password);
      delete updateData.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        mfaSecrets: true,
        oauthAccounts: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        mfaSecrets: true,
        oauthAccounts: true,
      },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: {
        mfaSecrets: true,
        oauthAccounts: true,
      },
    });
  }

  async findByResetToken(token: string) {
    return this.prisma.user.findUnique({
      where: { resetToken: token },
      include: {
        mfaSecrets: true,
        oauthAccounts: true,
      },
    });
  }

  async findByOAuth(provider: string, providerId: string) {
    const oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
      include: {
        user: {
          include: {
            mfaSecrets: true,
            oauthAccounts: true,
          },
        },
      },
    });

    return oauthAccount?.user;
  }
}
