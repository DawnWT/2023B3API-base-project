import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetProjectParamsDto {
  @IsUUID(4)
  @IsNotEmpty()
  id!: string;
}
