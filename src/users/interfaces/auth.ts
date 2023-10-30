import { ApiProperty } from '@nestjs/swagger';

export class LoginParams {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
