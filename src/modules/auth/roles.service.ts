import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      return await this.prisma.role.create({
        data: createRoleDto,
        include: {
          permissions: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Role name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.role.findMany({
      include: {
        permissions: true,
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      return await this.prisma.role.update({
        where: { id },
        data: updateRoleDto,
        include: {
          permissions: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Role name already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.role.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      throw error;
    }
  }

  async addPermission(roleId: string, permissionId: string) {
    try {
      return await this.prisma.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            connect: { id: permissionId },
          },
        },
        include: {
          permissions: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
      throw error;
    }
  }

  async removePermission(roleId: string, permissionId: string) {
    try {
      return await this.prisma.role.update({
        where: { id: roleId },
        data: {
          permissions: {
            disconnect: { id: permissionId },
          },
        },
        include: {
          permissions: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
      throw error;
    }
  }
} 