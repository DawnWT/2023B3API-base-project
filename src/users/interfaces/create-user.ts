import { ApiProperty } from '@nestjs/swagger';

export class CreateUser {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    enum: ['Employee', 'Admin', 'ProjectManager'],
    default: 'Employee',
  })
  role?: 'Employee' | 'Admin' | 'ProjectManager';
}
