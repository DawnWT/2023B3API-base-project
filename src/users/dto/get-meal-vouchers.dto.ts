import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class GetMealVouchersDto {
  @IsUUID(4)
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @Max(12)
  @Min(1)
  @Type(() => Number)
  month: number;
}
