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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseReturnDto = exports.PurchaseReturnItemDto = exports.PurchasePaymentDto = exports.UpdatePurchaseDto = exports.CreatePurchaseDto = exports.PurchaseItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["TRANSFER"] = "transfer";
    PaymentMethod["CHEQUE"] = "cheque";
})(PaymentMethod || (PaymentMethod = {}));
const mapped_types_1 = require("@nestjs/mapped-types");
class PurchaseItemDto {
    productId;
    variationId;
    qty;
    cost;
    tax;
    lotNumber;
    expiryDate;
}
exports.PurchaseItemDto = PurchaseItemDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PurchaseItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PurchaseItemDto.prototype, "variationId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PurchaseItemDto.prototype, "qty", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], PurchaseItemDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PurchaseItemDto.prototype, "tax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseItemDto.prototype, "lotNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], PurchaseItemDto.prototype, "expiryDate", void 0);
class CreatePurchaseDto {
    locationId;
    supplierId;
    subtotal;
    taxTotal;
    discount;
    shipping;
    grandTotal;
    items;
}
exports.CreatePurchaseDto = CreatePurchaseDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "locationId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "supplierId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "subtotal", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "taxTotal", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "discount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "shipping", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "grandTotal", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseItemDto),
    __metadata("design:type", Array)
], CreatePurchaseDto.prototype, "items", void 0);
class UpdatePurchaseDto extends (0, mapped_types_1.PartialType)(CreatePurchaseDto) {
}
exports.UpdatePurchaseDto = UpdatePurchaseDto;
class PurchasePaymentDto {
    method;
    amount;
    accountId;
}
exports.PurchasePaymentDto = PurchasePaymentDto;
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], PurchasePaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PurchasePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PurchasePaymentDto.prototype, "accountId", void 0);
class PurchaseReturnItemDto {
    purchaseItemId;
    productId;
    qty;
}
exports.PurchaseReturnItemDto = PurchaseReturnItemDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PurchaseReturnItemDto.prototype, "purchaseItemId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], PurchaseReturnItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PurchaseReturnItemDto.prototype, "qty", void 0);
class PurchaseReturnDto {
    reason;
    amount;
    items;
}
exports.PurchaseReturnDto = PurchaseReturnDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PurchaseReturnDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PurchaseReturnDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PurchaseReturnItemDto),
    __metadata("design:type", Array)
], PurchaseReturnDto.prototype, "items", void 0);
//# sourceMappingURL=purchase.dto.js.map