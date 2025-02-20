import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from '../../utils/test-utils';
import { PrismaService } from '../../../src/database/prisma.service';
import { createTestRole, createTestPermission } from '../../utils/test-utils';

describe('RolesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await setupTestApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /roles', () => {
    it('should create a new role', async () => {
      const createRoleDto = {
        name: 'test-role',
        description: 'Test role description',
      };

      const response = await request(app.getHttpServer())
        .post('/roles')
        .send(createRoleDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(createRoleDto.name);
      expect(response.body.description).toBe(createRoleDto.description);
    });

    it('should fail to create a role with existing name', async () => {
      const role = await createTestRole(prisma);
      const createRoleDto = {
        name: role.name,
        description: 'Another test role description',
      };

      await request(app.getHttpServer())
        .post('/roles')
        .send(createRoleDto)
        .expect(400);
    });
  });

  describe('GET /roles', () => {
    it('should return all roles', async () => {
      const role1 = await createTestRole(prisma);
      const role2 = await createTestRole(prisma);
      const permission = await createTestPermission(prisma);

      // Add permission to roles
      await prisma.role.update({
        where: { id: role1.id },
        data: {
          permissions: {
            connect: { id: permission.id },
          },
        },
      });

      await prisma.role.update({
        where: { id: role2.id },
        data: {
          permissions: {
            connect: { id: permission.id },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .get('/roles')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body.some((r: any) => r.id === role1.id)).toBe(true);
      expect(response.body.some((r: any) => r.id === role2.id)).toBe(true);
      expect(response.body[0].permissions).toHaveLength(1);
    });
  });

  describe('GET /roles/:id', () => {
    it('should return a role by id', async () => {
      const role = await createTestRole(prisma);
      const permission = await createTestPermission(prisma);

      // Add permission to role
      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            connect: { id: permission.id },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/roles/${role.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(role.id);
      expect(response.body.name).toBe(role.name);
      expect(response.body.description).toBe(role.description);
      expect(response.body.permissions).toHaveLength(1);
    });

    it('should return 404 for non-existent role', async () => {
      await request(app.getHttpServer())
        .get('/roles/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /roles/:id', () => {
    it('should update a role', async () => {
      const role = await createTestRole(prisma);
      const updateData = {
        name: 'updated-role',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/roles/${role.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(role.id);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 404 for non-existent role', async () => {
      const updateData = {
        name: 'updated-role',
        description: 'Updated description',
      };

      await request(app.getHttpServer())
        .patch('/roles/non-existent-id')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /roles/:id', () => {
    it('should delete a role', async () => {
      const role = await createTestRole(prisma);

      await request(app.getHttpServer())
        .delete(`/roles/${role.id}`)
        .expect(200);

      // Verify role is deleted
      const deletedRole = await prisma.role.findUnique({
        where: { id: role.id },
      });
      expect(deletedRole).toBeNull();
    });

    it('should return 404 for non-existent role', async () => {
      await request(app.getHttpServer())
        .delete('/roles/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /roles/:id/permissions/:permissionId', () => {
    it('should add a permission to a role', async () => {
      const role = await createTestRole(prisma);
      const permission = await createTestPermission(prisma);

      const response = await request(app.getHttpServer())
        .post(`/roles/${role.id}/permissions/${permission.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(role.id);
      expect(response.body.permissions).toHaveLength(1);
      expect(response.body.permissions[0].id).toBe(permission.id);
    });

    it('should return 404 for non-existent role', async () => {
      const permission = await createTestPermission(prisma);

      await request(app.getHttpServer())
        .post(`/roles/non-existent-id/permissions/${permission.id}`)
        .expect(404);
    });
  });

  describe('DELETE /roles/:id/permissions/:permissionId', () => {
    it('should remove a permission from a role', async () => {
      const role = await createTestRole(prisma);
      const permission = await createTestPermission(prisma);

      // Add permission to role first
      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            connect: { id: permission.id },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/roles/${role.id}/permissions/${permission.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(role.id);
      expect(response.body.permissions).toHaveLength(0);
    });

    it('should return 404 for non-existent role', async () => {
      const permission = await createTestPermission(prisma);

      await request(app.getHttpServer())
        .delete(`/roles/non-existent-id/permissions/${permission.id}`)
        .expect(404);
    });
  });
}); 