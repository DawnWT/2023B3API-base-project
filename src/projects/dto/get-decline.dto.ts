import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetDeclineDto {
  @IsUUID(4)
  @IsNotEmpty()
  id: string;
}
