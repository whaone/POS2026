"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = exports.DATABASE_TOKEN = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const db_1 = require("../../db");
exports.DATABASE_TOKEN = 'DATABASE_CONNECTION';
let DatabaseModule = class DatabaseModule {
    onApplicationBootstrap() {
    }
    async onApplicationShutdown() {
        await (0, db_1.closeDb)();
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.DATABASE_TOKEN,
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    return (0, db_1.initDb)({
                        host: config.get('DB_HOST') || 'localhost',
                        port: config.get('DB_PORT') || 5432,
                        user: config.get('DB_USER') || 'postgres',
                        password: config.get('DB_PASSWORD') || 'postgres',
                        database: config.get('DB_NAME') || 'pos2026',
                    });
                },
            },
        ],
        exports: [exports.DATABASE_TOKEN],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map