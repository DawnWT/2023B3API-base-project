import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { UserRoles } from '../types/utility';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3)
  username!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(8)
  password!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: ['Employee', 'Admin', 'ProjectManager'],
    default: 'Employee',
  })
  @IsString()
  @IsOptional()
  @IsEnum(['Employee', 'Admin', 'ProjectManager'])
  role?: UserRoles;
}
