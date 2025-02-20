import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from './types/role.enum';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new permission' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all permissions' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a permission by id' })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a permission' })
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a permission' })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
} 