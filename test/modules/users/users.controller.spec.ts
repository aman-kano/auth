import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersService } from '../../../src/modules/users/users.service';
import { createTestUser, createTestRole } from '../../utils/test-utils';
import { PrismaService } from '../../../src/database/prisma.service';
import { UpdateUserDto } from '../../../src/modules/users/dto/update-user.dto';
import { CreateUserDto } from '../../../src/modules/users/dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let prisma: PrismaService;

  const mockUsersService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await createTestUser(prisma);
      mockUsersService.create.mockResolvedValue(user);

      const result = await controller.create(createUserDto);
      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = await createTestUser(prisma);

      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne(user.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const user1 = await createTestUser(prisma);
      const user2 = await createTestUser(prisma);

      mockUsersService.findAll.mockResolvedValue([user1, user2]);

      const result = await controller.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(user1.id);
      expect(result[1].id).toBe(user2.id);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = await createTestUser(prisma);
      const updateData: UpdateUserDto = {
        username: 'updated-username',
      };

      mockUsersService.update.mockResolvedValue({
        ...user,
        ...updateData,
      });

      const result = await controller.update(user.id, updateData);
      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.username).toBe(updateData.username);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const user = await createTestUser(prisma);

      mockUsersService.remove.mockResolvedValue(user);

      const result = await controller.remove(user.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
    });
  });
}); 