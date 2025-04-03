import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.Console({
            format: winston.format.json(),
            level: configService.get('LOG_LEVEL', 'info'),
          }),
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.json(),
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.json(),
          }),
        ],
        format: winston.format.json(),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class LoggerModule {}
