import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/signup.dto';
import { genSalt, hash, compare } from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Err, Ok, Option } from '../../types/option';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(userDatas: CreateUserDto): Promise<Option<User>> {
    const userExist = await this.userRepository.exist({
      where: [{ email: userDatas.email }, { username: userDatas.username }],
    });

    if (userExist) {
      return Err('User already exist');
    }

    const user = new User(userDatas);

    const salt = await genSalt();
    user.password = await hash(user.password, salt);

    const savedUser = await this.userRepository.save(user);
    return Ok(savedUser);
  }

  async findAll(): Promise<Array<User>> {
    const users = await this.userRepository.find();

    return users;
  }

  async findOne(id: string): Promise<Option<User>> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return Err('User not found');
    } else {
      return Ok(user);
    }
  }

  async finOneByEmail(email: string): Promise<Option<User>> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return Err('User not found');
    } else {
      return Ok(user);
    }
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async userExist({
    username,
    email,
  }: {
    username?: string;
    email?: string;
  }): Promise<boolean> {
    const userExist = await this.userRepository.exist({
      where: [{ username }, { email }],
    });

    return userExist;
  }
}
