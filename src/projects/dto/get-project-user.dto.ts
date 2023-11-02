import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetProjectUserParamDto {
  @IsUUID(4)
  @IsNotEmpty()
  id!: string;
}
