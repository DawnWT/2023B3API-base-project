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
import { Request, Response } from 'express';
import { LoginParams } from './interfaces/auth';
import { UsersGuard } from './users.guard';
import { CreateUserDto } from './dto/signup.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/sign-up')
  async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const user = await this.usersService.create(createUserDto);

    if ('error' in user) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(user.error);
    }

    return res.status(HttpStatus.CREATED).json(user.content);
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

  @UseGuards(UsersGuard)
  @Get()
  async getUsers(@Res() res: Response) {
    const users = await this.usersService.findAll();

    return res.status(HttpStatus.OK).json(users);
  }

  @UseGuards(UsersGuard)
  @Get(':id')
  async getUser(@Param('id') id: string, @Res() res: Response) {
    const userOption = await this.usersService.findOne(id);

    if ('content' in userOption) {
      return res.status(HttpStatus.OK).json(userOption.content);
    }

    return res.status(HttpStatus.NOT_FOUND).send(userOption.error);
  }
}
