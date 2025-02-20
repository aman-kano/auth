import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      return await this.prisma.permission.create({
        data: createPermissionDto,
        include: {
          roles: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Permission name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.permission.findMany({
      include: {
        roles: true,
      },
    });
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: true,
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    try {
      return await this.prisma.permission.update({
        where: { id },
        data: updatePermissionDto,
        include: {
          roles: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Permission name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.permission.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Permission with ID ${id} not found`);
      }
      throw error;
    }
  }
} 