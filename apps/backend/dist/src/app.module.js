"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const core_module_1 = require("./core/core.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const tenant_interceptor_1 = require("./common/interceptors/tenant.interceptor");
const auth_module_1 = require("./modules/auth/auth.module");
const jwt_auth_guard_1 = require("./modules/auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("./common/guards/permissions.guard");
const approval_guard_1 = require("./common/guards/approval.guard");
const business_module_1 = require("./modules/business/business.module");
const users_module_1 = require("./modules/users/users.module");
const products_module_1 = require("./modules/products/products.module");
const stock_module_1 = require("./modules/stock/stock.module");
const sales_module_1 = require("./modules/sales/sales.module");
const cash_register_module_1 = require("./modules/cash-register/cash-register.module");
const customers_module_1 = require("./modules/customers/customers.module");
const contacts_module_1 = require("./modules/contacts/contacts.module");
const pricing_module_1 = require("./modules/pricing/pricing.module");
const purchases_module_1 = require("./modules/purchases/purchases.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            core_module_1.CoreModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            auth_module_1.AuthModule,
            business_module_1.BusinessModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            stock_module_1.StockModule,
            sales_module_1.SalesModule,
            cash_register_module_1.CashRegisterModule,
            customers_module_1.CustomersModule,
            contacts_module_1.ContactsModule,
            pricing_module_1.PricingModule,
            purchases_module_1.PurchasesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permissions_guard_1.PermissionsGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: approval_guard_1.ApprovalGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: tenant_interceptor_1.TenantInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map