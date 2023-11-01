import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { genSalt, hash } from 'bcrypt';
import { Option, Err, Ok } from '../../types/option';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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
  }: {
    username: string;
    email: string;
    password: string;
    role?: typeof User.prototype.role;
  }): Promise<Option<User>> {
    const userExist = await this.userService.userExist({ username, email });

    if (userExist) {
      return Err('User already exist');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = new User({
      email,
      password: hashedPassword,
      username,
      role,
    });

    const savedUser = await this.userService.create(user);

    if (savedUser.isErr()) {
      return Err(savedUser.error);
    }

    return Ok(savedUser.content);
  }
}
