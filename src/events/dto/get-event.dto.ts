import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetEventDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
