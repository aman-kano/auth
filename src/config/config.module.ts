import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validate } from './env.validation';

import { AppConfigService } from './config.service';
import configuration from './configuration';
import developmentConfig from './env.development';
import productionConfig from './env.production';
import testConfig from './env.test';

const envConfig = {
  development: developmentConfig,
  production: productionConfig,
  test: testConfig,
};

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
