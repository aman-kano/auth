import { PrismaService } from '../../src/database/prisma.service';
import { User, Role, Permission, Prisma } from '@prisma/client';
import { hash } from 'argon2';
import { Request } from 'express';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

interface AuthenticatedRequest extends Request {
  user: any;
}

export const createTestUser = async (
  prisma: PrismaService,
  data: Partial<Prisma.UserCreateInput> = {},
): Promise<User> => {
  const hashedPassword = await hash('Test123!@#');
  const defaultData: Prisma.UserCreateInput = {
    email: `test${Date.now()}@example.com`,
    username: `testuser${Date.now()}`,
    passwordHash: hashedPassword,
    status: 'ACTIVE',
  };

  return prisma.user.create({
    data: { ...defaultData, ...data },
  });
};

export const createTestRole = async (
  prisma: PrismaService,
  data: Partial<Prisma.RoleCreateInput> = {},
): Promise<Role> => {
  const defaultData: Prisma.RoleCreateInput = {
    name: `testrole${Date.now()}`,
    description: 'Test role',
  };

  return prisma.role.create({
    data: { ...defaultData, ...data },
  });
};

export const createTestPermission = async (
  prisma: PrismaService,
  data: Partial<Prisma.PermissionCreateInput> = {},
): Promise<Permission> => {
  const defaultData: Prisma.PermissionCreateInput = {
    name: `testpermission${Date.now()}`,
    description: 'Test permission',
    resource: 'test',
    action: 'read',
  };

  return prisma.permission.create({
    data: { ...defaultData, ...data },
  });
};

export const cleanupTestData = async (prisma: PrismaService) => {
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.permission.deleteMany();
};

export const mockRequest = (user: any): AuthenticatedRequest => {
  return {
    user,
    get: jest.fn(),
    header: jest.fn(),
    accepts: jest.fn(),
    acceptsCharsets: jest.fn(),
    acceptsEncodings: jest.fn(),
    acceptsLanguages: jest.fn(),
    param: jest.fn(),
    is: jest.fn(),
    protocol: 'http',
    secure: false,
    ip: '127.0.0.1',
    ips: [],
    subdomains: [],
    path: '/',
    hostname: 'localhost',
    host: 'localhost:3000',
    fresh: false,
    stale: true,
    xhr: false,
    cookies: {},
    signedCookies: {},
    secret: undefined,
    app: {},
  } as unknown as AuthenticatedRequest;
};

export const setupTestApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
};

export const teardownTestApp = async (app: INestApplication) => {
  const prisma = app.get<PrismaService>(PrismaService);
  await cleanupTestData(prisma);
  await app.close();
}; 