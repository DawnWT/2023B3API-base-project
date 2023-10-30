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
import { UsersGuard } from './users.guard';
import { CreateUserDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GetUserDto } from './dto/getUser.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('auth/sign-up')
  async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const user = await this.userService.create(createUserDto);

    if (user.isErr()) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(user.error);
    }

    return res.status(HttpStatus.CREATED).json(user.content);
  }

  @Post('auth/login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const accessToken = await this.userService.login(loginDto);

    if (accessToken.isErr()) {
      return res.status(HttpStatus.UNAUTHORIZED).send('password');
    }

    return res
      .status(HttpStatus.CREATED)
      .json({ access_token: accessToken.content.access_token });
  }

  @UseGuards(UsersGuard)
  @Get('me')
  async getSelf(@Req() req: Request, @Res() res: Response) {
    const { sub } = req['user'] as { sub: string; username: string };

    const user = await this.userService.findOne(sub);

    if (user.isErr()) {
      return res.status(HttpStatus.NOT_FOUND).send(user.error);
    }

    return res.status(HttpStatus.OK).json(user.content);
  }

  @UseGuards(UsersGuard)
  @Get()
  async getUsers(@Res() res: Response) {
    const users = await this.userService.findAll();

    return res.status(HttpStatus.OK).json(users);
  }

  @UseGuards(UsersGuard)
  @Get(':id')
  async getUser(@Param() { id }: GetUserDto, @Res() res: Response) {
    const userOption = await this.userService.findOne(id);

    if (userOption.isErr()) {
      return res.status(HttpStatus.NOT_FOUND).send(userOption.error);
    }

    return res.status(HttpStatus.OK).json(userOption.content);
  }
}
