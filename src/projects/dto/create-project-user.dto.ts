import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateProjectUserDto {
  @IsDateString()
  @IsNotEmpty()
  startDate!: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate!: Date;

  @IsUUID(4)
  @IsNotEmpty()
  userId!: string; //au format uuidv4

  @IsUUID(4)
  @IsNotEmpty()
  projectId!: string; //au format uuidv4
}
