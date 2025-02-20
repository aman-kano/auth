import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

import { BaseRepository } from '@/common/repositories/base.repository';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: {
          mfaSecrets: true,
          roles: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        include: {
          mfaSecrets: true,
          roles: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async create(data: CreateUserDto & { passwordHash: string }): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash: data.passwordHash,
        },
        include: {
          mfaSecrets: true,
          roles: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, data: UpdateUserDto & { passwordHash?: string }): Promise<User> {
    try {
      const updateData = {
        ...(data.username && { username: data.username }),
        ...(data.email && { email: data.email }),
        ...(data.passwordHash && { passwordHash: data.passwordHash }),
      };

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          mfaSecrets: true,
          roles: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: string): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
        include: {
          mfaSecrets: true,
          roles: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { username },
        include: {
          mfaSecrets: true,
          roles: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }
}
