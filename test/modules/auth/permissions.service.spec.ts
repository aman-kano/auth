import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from '../../../src/modules/auth/permissions.service';
import { PrismaService } from '../../../src/database/prisma.service';
import { createTestPermission, createTestRole } from '../../utils/test-utils';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    permission: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new permission', async () => {
      const createPermissionDto = {
        name: 'test-permission',
        description: 'Test permission description',
        resource: 'test-resource',
        action: 'test-action',
      };

      const permission = await createTestPermission(prisma);
      mockPrismaService.permission.create.mockResolvedValue(permission);

      const result = await service.create(createPermissionDto);
      expect(result).toBeDefined();
      expect(result.id).toBe(permission.id);
      expect(result.name).toBe(permission.name);
      expect(result.description).toBe(permission.description);
      expect(result.resource).toBe(permission.resource);
      expect(result.action).toBe(permission.action);
    });

    it('should throw BadRequestException when permission name already exists', async () => {
      const createPermissionDto = {
        name: 'existing-permission',
        description: 'Test permission description',
        resource: 'test-resource',
        action: 'test-action',
      };

      mockPrismaService.permission.create.mockRejectedValue(new Error('Unique constraint failed'));

      await expect(service.create(createPermissionDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const permission1 = await createTestPermission(prisma);
      const permission2 = await createTestPermission(prisma);
      const role = await createTestRole(prisma);

      mockPrismaService.permission.findMany.mockResolvedValue([
        { ...permission1, roles: [role] },
        { ...permission2, roles: [role] },
      ]);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(permission1.id);
      expect(result[1].id).toBe(permission2.id);
      expect(result[0].roles).toHaveLength(1);
      expect(result[1].roles).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a permission by id', async () => {
      const permission = await createTestPermission(prisma);
      const role = await createTestRole(prisma);

      mockPrismaService.permission.findUnique.mockResolvedValue({
        ...permission,
        roles: [role],
      });

      const result = await service.findOne(permission.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(permission.id);
      expect(result.roles).toHaveLength(1);
    });

    it('should throw NotFoundException when permission not found', async () => {
      mockPrismaService.permission.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const permission = await createTestPermission(prisma);
      const updateData = {
        name: 'updated-permission',
        description: 'Updated description',
      };

      mockPrismaService.permission.update.mockResolvedValue({
        ...permission,
        ...updateData,
      });

      const result = await service.update(permission.id, updateData);
      expect(result).toBeDefined();
      expect(result.id).toBe(permission.id);
      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
    });

    it('should throw NotFoundException when permission not found', async () => {
      mockPrismaService.permission.update.mockRejectedValue(new Error('Record not found'));

      await expect(service.update('non-existent-id', { name: 'test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a permission', async () => {
      const permission = await createTestPermission(prisma);

      mockPrismaService.permission.delete.mockResolvedValue(permission);

      const result = await service.remove(permission.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(permission.id);
    });

    it('should throw NotFoundException when permission not found', async () => {
      mockPrismaService.permission.delete.mockRejectedValue(new Error('Record not found'));

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 