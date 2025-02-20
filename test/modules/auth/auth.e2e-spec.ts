import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp, createTestUser, cleanupTestData } from '../../utils/test-utils';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    await cleanupTestData(app['prisma']);
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(registerDto.email);
          expect(res.body.user.username).toBe(registerDto.username);
        });
    });

    it('should fail to register with existing email', async () => {
      const registerDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
      };

      await createTestUser(app['prisma'], {
        email: registerDto.email,
        username: registerDto.username,
      });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user and return tokens', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      await createTestUser(app['prisma'], {
        email: loginDto.email,
        username: 'testuser',
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user.email).toBe(loginDto.email);
        });
    });

    it('should fail to login with invalid credentials', () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      await createTestUser(app['prisma'], {
        email: loginDto.email,
        username: 'testuser',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      const refreshTokenDto = {
        refreshToken: loginResponse.body.refreshToken,
      };

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshTokenDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should fail to refresh with invalid token', () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-token',
      };

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshTokenDto)
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should initiate password reset process', async () => {
      const forgotPasswordDto = {
        email: 'test@example.com',
      };

      await createTestUser(app['prisma'], {
        email: forgotPasswordDto.email,
        username: 'testuser',
      });

      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return success even for non-existent email', () => {
      const forgotPasswordDto = {
        email: 'nonexistent@example.com',
      };

      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const user = await createTestUser(app['prisma'], {
        email: 'test@example.com',
        username: 'testuser',
      });

      const forgotPasswordDto = {
        email: user.email,
      };

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordDto);

      const resetToken = await app['prisma'].user.findUnique({
        where: { id: user.id },
        select: { resetToken: true },
      });

      const resetPasswordDto = {
        token: resetToken.resetToken,
        password: 'newpassword',
      };

      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(resetPasswordDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should fail to reset password with invalid token', () => {
      const resetPasswordDto = {
        token: 'invalid-token',
        password: 'newpassword',
      };

      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(resetPasswordDto)
        .expect(400);
    });
  });
}); 