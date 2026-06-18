"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const stock_service_1 = require("./stock.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let StockGateway = class StockGateway {
    stockService;
    server;
    constructor(stockService) {
        this.stockService = stockService;
    }
    async handleStockCheck(data) {
        const result = await this.stockService.getStockByProduct(data.businessId, data.productId);
        return result;
    }
    handleStockChangedEvent(payload) {
        this.server.emit('stock:changed', payload);
    }
};
exports.StockGateway = StockGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], StockGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('stock:check'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StockGateway.prototype, "handleStockCheck", null);
__decorate([
    (0, event_emitter_1.OnEvent)('stock.changed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockGateway.prototype, "handleStockChangedEvent", null);
exports.StockGateway = StockGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true, namespace: '/' }),
    __metadata("design:paramtypes", [stock_service_1.StockService])
], StockGateway);
//# sourceMappingURL=stock.gateway.js.map