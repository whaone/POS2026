import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/auth.types';
import {
  CreateProductDto,
  CreateProductVariationDto,
} from '../dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductVariationDto,
} from '../dto/update-product.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  createProduct(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createProduct(user.businessId, dto);
  }

  @Get('products')
  findAllProducts(@CurrentUser() user: JwtPayload) {
    return this.productsService.findAllProducts(user.businessId);
  }

  @Get('products/:id')
  findProductById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.productsService.findProductById(user.businessId, id);
  }

  @Patch('products/:id')
  updateProduct(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(user.businessId, id, dto);
  }

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProduct(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.productsService.removeProduct(user.businessId, id);
  }

  @Get('products/by-barcode/:code')
  findByBarcode(@CurrentUser() user: JwtPayload, @Param('code') code: string) {
    return this.productsService.findProductByBarcode(user.businessId, code);
  }

  // Product Variations
  @Post('product-variations')
  createVariation(@Body() dto: CreateProductVariationDto) {
    return this.productsService.createVariation(dto);
  }

  @Get('products/:productId/variations')
  findAllVariations(@Param('productId') productId: string) {
    return this.productsService.findAllVariations(productId);
  }

  @Patch('product-variations/:id')
  updateVariation(
    @Param('id') id: string,
    @Body() dto: UpdateProductVariationDto,
  ) {
    return this.productsService.updateVariation(id, dto);
  }

  @Delete('product-variations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeVariation(@Param('id') id: string) {
    return this.productsService.removeVariation(id);
  }

  // Bulk import: client parses the CSV and posts the resulting product rows.
  @Post('products/import')
  importProducts(
    @CurrentUser() user: JwtPayload,
    @Body() productsData: CreateProductDto[],
  ) {
    return this.productsService.importCsv(user.businessId, productsData);
  }

  @Post('products/barcodes/print')
  async printBarcodes(
    @CurrentUser() user: JwtPayload,
    @Body() payload: { productId: string; variationId?: string; qty: number }[],
  ) {
    const { count, labels } =
      await this.productsService.generateBarcodeLabels(
        user.businessId,
        payload,
      );
    return { success: true, count, labels };
  }

  // Master Data
  @Get('categories')
  findAllCategories(@CurrentUser() user: JwtPayload) {
    return this.productsService.findAllCategories(user.businessId);
  }

  @Get('brands')
  findAllBrands(@CurrentUser() user: JwtPayload) {
    return this.productsService.findAllBrands(user.businessId);
  }

  @Get('units')
  findAllUnits(@CurrentUser() user: JwtPayload) {
    return this.productsService.findAllUnits(user.businessId);
  }

  @Get('taxes')
  findAllTaxes(@CurrentUser() user: JwtPayload) {
    return this.productsService.findAllTaxes(user.businessId);
  }
}
