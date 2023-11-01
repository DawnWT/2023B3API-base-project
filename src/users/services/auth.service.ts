import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { compare, genSalt, hash } from 'bcrypt';
import { Option, Err, Ok } from '../../types/option';
import { Payload } from '../../types/payload';

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

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Option<{ access_token: string }>> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return Err('User not found');
    }

    const isMatch = await compare(password, user.password);

    if (isMatch) {
      const payload: Payload = { id: user.id, role: user.role };
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
