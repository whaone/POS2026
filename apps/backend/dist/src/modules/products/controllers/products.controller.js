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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("../services/products.service");
const current_user_decorator_1 = require("../../../common/decorators/current-user.decorator");
const create_product_dto_1 = require("../dto/create-product.dto");
const update_product_dto_1 = require("../dto/update-product.dto");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    createProduct(user, dto) {
        return this.productsService.createProduct(user.businessId, dto);
    }
    findAllProducts(user) {
        return this.productsService.findAllProducts(user.businessId);
    }
    findProductById(user, id) {
        return this.productsService.findProductById(user.businessId, id);
    }
    updateProduct(user, id, dto) {
        return this.productsService.updateProduct(user.businessId, id, dto);
    }
    removeProduct(user, id) {
        return this.productsService.removeProduct(user.businessId, id);
    }
    findByBarcode(user, code) {
        return this.productsService.findProductByBarcode(user.businessId, code);
    }
    createVariation(dto) {
        return this.productsService.createVariation(dto);
    }
    findAllVariations(productId) {
        return this.productsService.findAllVariations(productId);
    }
    updateVariation(id, dto) {
        return this.productsService.updateVariation(id, dto);
    }
    removeVariation(id) {
        return this.productsService.removeVariation(id);
    }
    importProducts(user, productsData) {
        return this.productsService.importCsv(user.businessId, productsData);
    }
    printBarcodes(user, payload) {
        return {
            success: true,
            message: 'Barcode print jobs queued',
            jobs: payload,
        };
    }
    findAllCategories(user) {
        return this.productsService.findAllCategories(user.businessId);
    }
    findAllBrands(user) {
        return this.productsService.findAllBrands(user.businessId);
    }
    findAllUnits(user) {
        return this.productsService.findAllUnits(user.businessId);
    }
    findAllTaxes(user) {
        return this.productsService.findAllTaxes(user.businessId);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Post)('products'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllProducts", null);
__decorate([
    (0, common_1.Get)('products/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findProductById", null);
__decorate([
    (0, common_1.Patch)('products/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "removeProduct", null);
__decorate([
    (0, common_1.Get)('products/by-barcode/:code'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findByBarcode", null);
__decorate([
    (0, common_1.Post)('product-variations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductVariationDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "createVariation", null);
__decorate([
    (0, common_1.Get)('products/:productId/variations'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllVariations", null);
__decorate([
    (0, common_1.Patch)('product-variations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductVariationDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "updateVariation", null);
__decorate([
    (0, common_1.Delete)('product-variations/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "removeVariation", null);
__decorate([
    (0, common_1.Post)('products/import'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "importProducts", null);
__decorate([
    (0, common_1.Post)('products/barcodes/print'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "printBarcodes", null);
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Get)('brands'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllBrands", null);
__decorate([
    (0, common_1.Get)('units'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllUnits", null);
__decorate([
    (0, common_1.Get)('taxes'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAllTaxes", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map