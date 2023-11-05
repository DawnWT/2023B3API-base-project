import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  eventDescription?: string;

  @IsString()
  @IsEnum(['RemoteWork', 'PaidLeave'])
  @IsNotEmpty()
  eventType!: 'RemoteWork' | 'PaidLeave';
}
