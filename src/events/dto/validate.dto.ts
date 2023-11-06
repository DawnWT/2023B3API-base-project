import { IsNotEmpty, IsUUID } from 'class-validator';

export class ValidateDto {
  @IsUUID(4)
  @IsNotEmpty()
  id: string;
}
