"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'E-SRV-500';
        let details;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse;
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
            }
            else {
                message = String(exceptionResponse);
                code = this.mapStatusToCode(status);
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        const errorResponse = {
            code,
            message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        if (details !== undefined) {
            errorResponse.details = details;
        }
        this.logger.error(`${request.method} ${request.url} - ${status} - ${message}`, exception instanceof Error ? exception.stack : undefined);
        response.status(status).json(errorResponse);
    }
    mapStatusToCode(status) {
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
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map