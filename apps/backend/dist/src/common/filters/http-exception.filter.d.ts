import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export interface ErrorResponse {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    details?: unknown;
}
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(exception: unknown, host: ArgumentsHost): void;
    private mapStatusToCode;
}
