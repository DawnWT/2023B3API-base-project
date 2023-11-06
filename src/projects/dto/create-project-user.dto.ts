import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateProjectUserDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate!: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate!: Date;

  @IsUUID(4)
  @IsNotEmpty()
  userId!: string; //au format uuidv4

  @IsUUID(4)
  @IsNotEmpty()
  projectId!: string; //au format uuidv4
}
