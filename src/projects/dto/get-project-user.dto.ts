import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetProjectUserDto {
  @IsUUID(4)
  @IsNotEmpty()
  id!: string;
}
