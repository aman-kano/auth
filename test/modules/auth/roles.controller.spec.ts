import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from '../../../src/modules/auth/roles.controller';
import { RolesService } from '../../../src/modules/auth/roles.service';
import { createTestRole, createTestPermission } from '../../utils/test-utils';
import { PrismaService } from '../../../src/database/prisma.service';
import { CreateRoleDto } from '../../../src/modules/auth/dto/create-role.dto';
import { UpdateRoleDto } from '../../../src/modules/auth/dto/update-role.dto';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;
  let prisma: PrismaService;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addPermission: jest.fn(),
    removePermission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'test-role',
        description: 'Test role description',
      };

      const role = await createTestRole(prisma);
      mockRolesService.create.mockResolvedValue(role);

      const result = await controller.create(createRoleDto);
      expect(result).toBeDefined();
      expect(result.id).toBe(role.id);
      expect(result.name).toBe(role.name);
      expect(result.description).toBe(role.description);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const role1 = await createTestRole(prisma);
      const role2 = await createTestRole(prisma);
      const permission = await createTestPermission(prisma);

      mockRolesService.findAll.mockResolvedValue([
        { ...role1, permissions: [permission] },
        { ...role2, permissions: [permission] },
      ]);

      const result = await controller.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(role1.id);
      expect(result[1].id).toBe(role2.id);
      expect(result[0].permissions).toHaveLength(1);
      expect(result[1].permissions).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const role = await createTestRole(prisma);
      const permission = await createTestPermission(prisma);

      mockRolesService.findOne.mockResolvedValue({
        ...role,
        permissions: [permission],
      });

      const result = await controller.findOne(role.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(role.id);
      expect(result.permissions).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const role = await createTestRole(prisma);
      const updateData: UpdateRoleDto = {
        name: 'updated-role',
        description: 'Updated description',
      };

      mockRolesService.update.mockResolvedValue({
        ...role,
        ...updateData,
      });

      const result = await controller.update(role.id, updateData);
      expect(result).toBeDefined();
      expect(result.id).toBe(role.id);
      expect(result.name).toBe(updateData.name);
      expect(result.description).toBe(updateData.description);
    });
  });

  describe('remove', () => {
    it('should remove a role', async () => {
      const role = await createTestRole(prisma);

      mockRolesService.remove.mockResolvedValue(role);

      const result = await controller.remove(role.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(role.id);
    });
  });

  describe('addPermission', () => {
    it('should add a permission to a role', async () => {
      const role = await createTestRole(prisma);
      const permission = await createTestPermission(prisma);

      mockRolesService.addPermission.mockResolvedValue({
        ...role,
        permissions: [permission],
      });

      const result = await controller.addPermission(role.id, permission.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(role.id);
      expect(result.permissions).toHaveLength(1);
      expect(result.permissions[0].id).toBe(permission.id);
    });
  });

  describe('removePermission', () => {
    it('should remove a permission from a role', async () => {
      const role = await createTestRole(prisma);
      const permission = await createTestPermission(prisma);

      mockRolesService.removePermission.mockResolvedValue({
        ...role,
        permissions: [],
      });

      const result = await controller.removePermission(role.id, permission.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(role.id);
      expect(result.permissions).toHaveLength(0);
    });
  });
}); 