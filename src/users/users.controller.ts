import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUser } from './interfaces/create-user';
import { Request, Response } from 'express';
import { LoginParams } from './interfaces/auth';
import { UsersGuard } from './users.guard';

@Controller('users')
export class UsersController {
  private emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  constructor(private readonly usersService: UsersService) {}

  @Post('auth/sign-up')
  async signup(@Body() signupParams: CreateUser, @Res() res: Response) {
    if (!signupParams.username) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('username should not be empty');
    }

    if (!signupParams.email) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('email should not be empty');
    }

    if (!signupParams.password) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('password should not be empty');
    }

    if (signupParams.username.length < 3) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('username should be at least 3 character long');
    }

    if (signupParams.password.length < 8) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('password should be at least 8 character long');
    }

    if (!this.emailRegex.test(signupParams.email)) {
      return res.status(HttpStatus.BAD_REQUEST).send('email must be an email');
    }

    const user = await this.usersService.create(signupParams);

    return res.status(HttpStatus.CREATED).json(user);
  }

  @Post('auth/login')
  async login(@Body() loginParams: LoginParams, @Res() res: Response) {
    const accessToken = await this.usersService.login(loginParams);

    if ('content' in accessToken) {
      return res
        .status(HttpStatus.CREATED)
        .json({ access_token: accessToken.content.access_token });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send('password');
    }
  }

  @UseGuards(UsersGuard)
  @Get('me')
  async getSelf(@Req() req: Request, @Res() res: Response) {
    const { sub } = req['user'] as { sub: string; username: string };

    const user = await this.usersService.findOne(sub);

    if ('error' in user) {
      return res.status(HttpStatus.NOT_FOUND).send(user.error);
    }

    return res.status(HttpStatus.OK).json(user.content);
  }

  @Get(':id')
  async getUser(@Param('id') id: string, @Res() res: Response) {
    const userOption = await this.usersService.findOne(id);

    if ('content' in userOption) {
      return res.status(HttpStatus.OK).json(userOption.content);
    }

    return res.status(HttpStatus.NOT_FOUND).send(userOption.error);
  }
}
