import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum LocationType {
  STORE = 'store',
  WAREHOUSE = 'warehouse',
}

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(LocationType)
  @IsOptional()
  type?: LocationType;

  @IsString()
  @IsOptional()
  address?: string;
}
