import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from './types/role.enum';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new role' })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a role by id' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a role' })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a role' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions/:permissionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Add a permission to a role' })
  addPermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.addPermission(id, permissionId);
  }

  @Delete(':id/permissions/:permissionId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a permission from a role' })
  removePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.removePermission(id, permissionId);
  }
} 