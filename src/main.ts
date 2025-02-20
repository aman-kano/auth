import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import * as path from 'path';
import * as fs from 'fs';

import { AppModule } from './app.module';

async function bootstrap() {
  // Create .otel directory if it doesn't exist
  const otelDir = path.join(process.cwd(), '.otel');
  if (!fs.existsSync(otelDir)) {
    fs.mkdirSync(otelDir, { recursive: true });
  }

  // Initialize OpenTelemetry
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'auth-service',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          ignoreIncomingPaths: ['/health', '/metrics'],
        },
        '@opentelemetry/instrumentation-fastify': {
          enabled: true,
          requestHook: (span, info) => {
            span.setAttribute('fastify.route', info.request.routerPath);
            span.setAttribute('fastify.method', info.request.method);
          },
        },
        '@opentelemetry/instrumentation-nestjs-core': {
          enabled: true,
        },
      }),
    ],
  });

  // Start OpenTelemetry SDK
  await sdk.start();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      trustProxy: true,
    }),
  );

  const configService = app.get(ConfigService);

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Set global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // CORS configuration
  const corsOrigins = configService.get('CORS_ORIGIN', 'http://localhost:3000').split(',');
  await app.register(cors as any, {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Security middleware
  await app.register(helmet as any);
  await app.register(cookie as any, {
    secret: configService.get('JWT_SECRET'),
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('The authentication service API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('/api/v1', 'API v1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start the application
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);

  // Handle shutdown
  process.on('SIGTERM', async () => {
    await sdk.shutdown();
    await app.close();
    process.exit(0);
  });
}

bootstrap();
