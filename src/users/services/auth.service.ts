import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { compare, genSalt, hash } from 'bcrypt';
import { Option, Err, Ok } from '../../types/option';
import { Payload } from '../../types/payload';

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
  }: Omit<User, 'id' | 'projectUser'>): Promise<Option<User>> {
    const userExist = await this.userService.userExist({ username, email });

    if (userExist) {
      return Err('User already exist');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = {
      email,
      password: hashedPassword,
      username,
      role,
    };

    const savedUser = await this.userService.create(user);

    if (savedUser.isErr()) {
      return Err(savedUser.error);
    }

    return Ok(savedUser.content);
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Option<{ access_token: string }>> {
    const userOption = await this.userService.finOneByEmail(email);

    if (userOption.isErr()) {
      return Err('User not found');
    }

    const isMatch = await compare(password, userOption.content.password);

    if (isMatch) {
      const payload: Payload = {
        id: userOption.content.id,
        role: userOption.content.role,
      };
      return Ok({
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }),
      });
    } else {
      return Err('Wrong password');
    }
  }
}
