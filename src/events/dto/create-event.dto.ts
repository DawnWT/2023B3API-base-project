import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventDto {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;

  @IsString()
  eventDescription?: string;

  @IsString()
  @IsEnum(['RemoteWork', 'PaidLeave'])
  @IsNotEmpty()
  eventType!: 'RemoteWork' | 'PaidLeave';
}
