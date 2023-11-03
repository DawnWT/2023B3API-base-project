import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetProjectDto {
  @IsUUID(4)
  @IsNotEmpty()
  id!: string;
}
