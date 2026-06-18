"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const cart_controller_1 = require("./controllers/cart.controller");
const cart_service_1 = require("./services/cart.service");
const checkout_controller_1 = require("./controllers/checkout.controller");
const checkout_service_1 = require("./services/checkout.service");
const tab_controller_1 = require("./controllers/tab.controller");
const tab_service_1 = require("./services/tab.service");
const pricing_module_1 = require("../pricing/pricing.module");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        imports: [pricing_module_1.PricingModule],
        controllers: [cart_controller_1.CartController, checkout_controller_1.CheckoutController, tab_controller_1.TabController],
        providers: [cart_service_1.CartService, checkout_service_1.CheckoutService, tab_service_1.TabService],
        exports: [cart_service_1.CartService, checkout_service_1.CheckoutService, tab_service_1.TabService],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map