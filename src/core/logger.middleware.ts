import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new LoggerService();

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';

    this.logger.log(
      `Request: ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`,
      'LoggerMiddleware',
    );

    next();
  }
}