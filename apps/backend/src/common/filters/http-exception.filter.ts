import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'E-SRV-500';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message =
          typeof resp.message === 'string'
            ? resp.message
            : Array.isArray(resp.message)
              ? resp.message.join(', ')
              : exception.message;
        details = resp.details ?? resp.error;
        code =
          typeof resp.code === 'string'
            ? resp.code
            : this.mapStatusToCode(status);
      } else {
        message = String(exceptionResponse);
        code = this.mapStatusToCode(status);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      code,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (details !== undefined) {
      errorResponse.details = details;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case 400:
        return 'E-VAL-400';
      case 401:
        return 'E-AUTH-401';
      case 403:
        return 'E-PERM-403';
      case 409:
        return 'E-DUP-409';
      case 422:
        return 'E-PAY-422';
      default:
        return 'E-SRV-500';
    }
  }
}
