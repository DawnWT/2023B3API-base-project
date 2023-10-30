import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetUserDto {
  @ApiProperty()
  @IsUUID(4)
  id!: string;
}
