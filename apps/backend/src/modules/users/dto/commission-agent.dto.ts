import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCommissionAgentDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @IsNotEmpty()
  rate: number;
}

export class UpdateCommissionAgentDto extends PartialType(
  CreateCommissionAgentDto,
) {}
