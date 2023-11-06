import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetValidateDto {
  @IsUUID(4)
  @IsNotEmpty()
  id: string;
}
