import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { RedisService } from '../src/database/redis.service';
import { ConfigService } from '@nestjs/config';

export let app: INestApplication;
export let prisma: PrismaService;
export let redis: RedisService;
export let config: ConfigService;

export const setupTestApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  prisma = moduleFixture.get<PrismaService>(PrismaService);
  redis = moduleFixture.get<RedisService>(RedisService);
  config = moduleFixture.get<ConfigService>(ConfigService);

  await app.init();
  return app;
};

export const teardownTestApp = async () => {
  await prisma.$disconnect();
  await redis.disconnect();
  await app.close();
};

beforeAll(async () => {
  await setupTestApp();
});

afterAll(async () => {
  await teardownTestApp();
}); 