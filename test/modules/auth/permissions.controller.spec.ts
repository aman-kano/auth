import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from '../../../src/modules/auth/permissions.controller';
import { PermissionsService } from '../../../src/modules/auth/permissions.service';
import { createTestPermission, createTestRole } from '../../utils/test-utils';
import { PrismaService } from '../../../src/database/prisma.service';
import { CreatePermissionDto } from '../../../src/modules/auth/dto/create-permission.dto';
import { UpdatePermissionDto } from '../../../src/modules/auth/dto/update-permission.dto';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let service: PermissionsService;
  let prisma: PrismaService;

  const mockPermissionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
    service = module.get<PermissionsService>(PermissionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new permission', async () => {
      const createPermissionDto: CreatePermissionDto = {
        name: 'test-permission',
        description: 'Test permission description',
        resource: 'test-resource',
        action: 'test-action',
      };

      const permission = await createTestPermission(prisma);
      mockPermissionsService.create.mockResolvedValue(permission);

      const result = await controller.create(createPermissionDto);
      expect(result).toBeDefined();
      expect(result.id).toBe(permission.id);
      expect(result.name).toBe(permission.name);
      expect(result.description).toBe(permission.description);
      expect(result.resource).toBe(permission.resource);
      expect(result.action).toBe(permission.action);
    });
  });

  describe('findAll', () => {
    it('should return all permissions', async () => {
      const permission1 = await createTestPermission(prisma);
      const permission2 = await createTestPermission(prisma);
      const role = await createTestRole(prisma);

      mockPermissionsService.findAll.mockResolvedValue([
        { ...permission1, roles: [role] },
        { ...permission2, roles: [role] },
      ]);

      const result = await controller.findAll();
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

      mockPermissionsService.findOne.mockResolvedValue({
        ...permission,
        roles: [role],
      });

      const result = await controller.findOne(permission.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(permission.id);
      expect(result.roles).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a permission', async () => {
      const permission = await createTestPermission(prisma);
      const updateData: UpdatePermissionDto = {
        name: 'updated-permission',
        description: 'Updated description',
      };

      mockPermissionsService.update.mockResolvedValue({
        ...permission,
        ...updateData,
      });

      const result = await controller.update(permission.id, updateData);
      expect(result).toBeDefined();
      expect(result.id).toBe(permission.id);
      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
    });
  });

  describe('remove', () => {
    it('should remove a permission', async () => {
      const permission = await createTestPermission(prisma);

      mockPermissionsService.remove.mockResolvedValue(permission);

      const result = await controller.remove(permission.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(permission.id);
    });
  });
}); 