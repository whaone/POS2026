import { IsInt, Min } from 'class-validator';

export class CloseRegisterDto {
  @IsInt()
  @Min(0)
  closingCounted: number;
}
