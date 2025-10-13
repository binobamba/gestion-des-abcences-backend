import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from './logger.service';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new LoggerService();

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    this.logger.warn(
      `Validation Error: ${JSON.stringify(exceptionResponse)}`,
      'ValidationExceptionFilter',
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: 'Validation failed',
      errors: this.formatValidationErrors(exceptionResponse),
    });
  }

  private formatValidationErrors(response: any) {
    if (typeof response === 'object' && response.message) {
      return Array.isArray(response.message) ? response.message : [response.message];
    }
    return [response];
  }
}