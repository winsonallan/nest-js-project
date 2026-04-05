import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()} ${message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),

    new (winston.transports as any).DailyRotateFile({
      dirname: 'logs',
      filename: 'api-%DATE%.txt',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
  ],
});

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      logger.info(`${method} ${originalUrl} ${statusCode} - ${ms}ms`);
    });

    next();
  }
}