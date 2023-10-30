import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID(4)
  @IsNotEmpty()
  referringEmployeeId!: string;
}
