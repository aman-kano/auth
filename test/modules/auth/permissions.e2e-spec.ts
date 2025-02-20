import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from '../../utils/test-utils';
import { PrismaService } from '../../../src/database/prisma.service';
import { createTestUser, createTestRole, createTestPermission } from '../../utils/test-utils';
import { hash } from 'argon2';

describe('Permissions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminUser: any;

  beforeAll(async () => {
    app = await setupTestApp();
    prisma = app.get<PrismaService>(PrismaService);
    
    // Create admin role first
    const adminRole = await createTestRole(prisma, {
      name: 'ADMIN',
      description: 'Administrator role',
    });
    
    // Create admin user and get token
    const passwordHash = await hash('password123');
    adminUser = await createTestUser(prisma, {
      email: 'admin@test.com',
      passwordHash,
      roles: {
        connect: {
          id: adminRole.id,
        },
      },
    });
    
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });
    
    adminToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /permissions', () => {
    it('should create a new permission', async () => {
      const createPermissionDto = {
        name: 'test-permission',
        description: 'Test permission description',
        resource: 'test-resource',
        action: 'test-action',
      };

      const response = await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createPermissionDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(createPermissionDto.name);
      expect(response.body.description).toBe(createPermissionDto.description);
      expect(response.body.resource).toBe(createPermissionDto.resource);
      expect(response.body.action).toBe(createPermissionDto.action);
    });

    it('should fail to create permission with duplicate name', async () => {
      const permission = await createTestPermission(prisma);
      
      const createPermissionDto = {
        name: permission.name,
        description: 'Another test permission description',
        resource: 'test-resource',
        action: 'test-action',
      };

      await request(app.getHttpServer())
        .post('/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createPermissionDto)
        .expect(400);
    });
  });

  describe('GET /permissions', () => {
    it('should return all permissions', async () => {
      const permission1 = await createTestPermission(prisma);
      const permission2 = await createTestPermission(prisma);
      const role = await createTestRole(prisma);

      const response = await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body.some(p => p.id === permission1.id)).toBe(true);
      expect(response.body.some(p => p.id === permission2.id)).toBe(true);
    });
  });

  describe('GET /permissions/:id', () => {
    it('should return a permission by id', async () => {
      const permission = await createTestPermission(prisma);
      const role = await createTestRole(prisma);

      const response = await request(app.getHttpServer())
        .get(`/permissions/${permission.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(permission.id);
      expect(response.body.name).toBe(permission.name);
      expect(response.body.description).toBe(permission.description);
      expect(response.body.resource).toBe(permission.resource);
      expect(response.body.action).toBe(permission.action);
    });

    it('should return 404 for non-existent permission', async () => {
      await request(app.getHttpServer())
        .get('/permissions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /permissions/:id', () => {
    it('should update a permission', async () => {
      const permission = await createTestPermission(prisma);
      const updateData = {
        name: 'updated-permission',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/permissions/${permission.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(permission.id);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 404 for updating non-existent permission', async () => {
      const updateData = {
        name: 'updated-permission',
        description: 'Updated description',
      };

      await request(app.getHttpServer())
        .patch('/permissions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /permissions/:id', () => {
    it('should delete a permission', async () => {
      const permission = await createTestPermission(prisma);

      const response = await request(app.getHttpServer())
        .delete(`/permissions/${permission.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(permission.id);

      // Verify permission is deleted
      await request(app.getHttpServer())
        .get(`/permissions/${permission.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 404 for deleting non-existent permission', async () => {
      await request(app.getHttpServer())
        .delete('/permissions/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
}); 