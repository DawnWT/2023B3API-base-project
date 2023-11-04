import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { compare, genSalt, hash } from 'bcrypt';
import { Option, Err, Ok } from '../../types/option';
import { Payload } from '../../types/payload';
import { CleanUser } from '../types/utility';
import { CreateUserDto } from '../dto/signup.dto';
import { BaseError } from '../../types/error';
import {
  UserAlreadyExistException,
  UserNotFoundException,
  WrongPasswordException,
} from '../types/error';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);

    return hashedPassword;
  }

  async signup({
    email,
    password,
    username,
    role,
  }: CreateUserDto): Promise<
    Option<CleanUser, UserAlreadyExistException | BaseError>
  > {
    const hashedPassword = await this.hashPassword(password);

    const user = {
      email,
      password: hashedPassword,
      username,
      role,
    };

    const savedUser = await this.userService.create(user);

    if (savedUser.isErr()) {
      return savedUser;
    }

    return Ok(savedUser.content);
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<
    Option<
      { access_token: string },
      WrongPasswordException | UserNotFoundException | BaseError
    >
  > {
    const user = await this.userService.finOneByEmail(email, true);

    if (user.isErr()) {
      return user;
    }

    const isMatch = await compare(password, user.content.password);

    if (isMatch) {
      const payload: Payload = {
        id: user.content.id,
        role: user.content.role,
      };
      return Ok({
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }),
      });
    } else {
      return Err(new WrongPasswordException());
    }
  }
}
