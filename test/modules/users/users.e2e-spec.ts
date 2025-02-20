import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp } from '../../utils/test-utils';
import { PrismaService } from '../../../src/database/prisma.service';
import { createTestUser } from '../../utils/test-utils';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await setupTestApp();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await teardownTestApp(app);
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(createUserDto.email);
      expect(response.body.username).toBe(createUserDto.username);
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should fail to create a user with existing email', async () => {
      const user = await createTestUser(prisma);
      const createUserDto = {
        username: 'anotheruser',
        email: user.email,
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const user1 = await createTestUser(prisma);
      const user2 = await createTestUser(prisma);

      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body.some((u: any) => u.id === user1.id)).toBe(true);
      expect(response.body.some((u: any) => u.id === user2.id)).toBe(true);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const user = await createTestUser(prisma);

      const response = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
      expect(response.body.username).toBe(user.username);
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const user = await createTestUser(prisma);
      const updateData = {
        username: 'updated-username',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(user.id);
      expect(response.body.username).toBe(updateData.username);
      expect(response.body.email).toBe(user.email);
      expect(response.body.passwordHash).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = {
        username: 'updated-username',
      };

      await request(app.getHttpServer())
        .patch('/users/non-existent-id')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const user = await createTestUser(prisma);

      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(200);

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .delete('/users/non-existent-id')
        .expect(404);
    });
  });
}); 