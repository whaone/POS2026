import { PartialType } from '@nestjs/mapped-types';
import {
  CreateProductDto,
  CreateProductVariationDto,
} from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
export class UpdateProductVariationDto extends PartialType(
  CreateProductVariationDto,
) {}
