import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeclineDto {
  @IsUUID(4)
  @IsNotEmpty()
  id: string;
}
