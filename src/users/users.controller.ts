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
import { UsersService } from './services/users.service';
import { Request, Response } from 'express';
import { IsAuth } from './guards/isAuth.guard';
import { CreateUserDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GetUserDto } from './dto/getUser.dto';
import { AuthService } from './services/auth.service';
import { Payload } from '../types/payload';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('auth/sign-up')
  async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const userOption = await this.authService.signup(createUserDto);

    if (userOption.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(userOption.error);
    }

    const cleanUser = this.userService.removeProps(
      userOption.content,
      'password',
    );

    return res.status(HttpStatus.CREATED).json(cleanUser);
  }

  @Post('auth/login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const accessTokenOption = await this.authService.login(loginDto);

    if (accessTokenOption.isErr()) {
      return res.status(HttpStatus.UNAUTHORIZED).send('Wrong credentials');
    }

    return res
      .status(HttpStatus.CREATED)
      .json({ access_token: accessTokenOption.content.access_token });
  }

  @UseGuards(IsAuth)
  @Get('me')
  async getSelf(@Req() req: Request, @Res() res: Response) {
    const { id } = req['user'] as Payload;

    const userOption = await this.userService.findOne(id);

    if (userOption.isErr()) {
      return res.status(HttpStatus.NOT_FOUND).send(userOption.error);
    }

    const cleanUser = this.userService.removeProps(
      userOption.content,
      'password',
    );

    return res.status(HttpStatus.OK).json(cleanUser);
  }

  @UseGuards(IsAuth)
  @Get()
  async getUsers(@Res() res: Response) {
    const users = await this.userService.findAll();

    const cleanUsers = users.map((u) =>
      this.userService.removeProps(u, 'password'),
    );

    return res.status(HttpStatus.OK).json(cleanUsers);
  }

  @UseGuards(IsAuth)
  @Get(':id')
  async getUser(@Param() { id }: GetUserDto, @Res() res: Response) {
    const userOption = await this.userService.findOne(id);

    if (userOption.isErr()) {
      return res.status(HttpStatus.NOT_FOUND).send(userOption.error);
    }

    const cleanUser = this.userService.removeProps(
      userOption.content,
      'password',
    );

    return res.status(HttpStatus.OK).json(cleanUser);
  }
}
