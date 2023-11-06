import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateProjectUserDto {
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string;

  @IsUUID(4)
  @IsNotEmpty()
  userId!: string; //au format uuidv4

  @IsUUID(4)
  @IsNotEmpty()
  projectId!: string; //au format uuidv4
}
