import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class OpenRegisterDto {
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @IsInt()
  @Min(0)
  openingBalance: number;
}
