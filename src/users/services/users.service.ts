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

  async create(
    userDatas: CreateUserDto,
  ): Promise<Option<Omit<User, 'password'>>> {
    const userExist = await this.userRepository.exist({
      where: [{ email: userDatas.email }, { username: userDatas.username }],
    });

    if (userExist) {
      return Err('User already exist');
    }

    const user = new User(userDatas);

    const salt = await genSalt();
    user.password = await hash(user.password, salt);

    const { email, id, username, role } = await this.userRepository.save(user);
    return Ok({ email, id, username, role });
  }

  async findAll(): Promise<Array<Omit<User, 'password'>>> {
    const users = await this.userRepository.find();

    const usersWithoutPassword = users.map((user) => ({
      username: user.username,
      id: user.id,
      email: user.email,
      role: user.role,
    }));

    return usersWithoutPassword;
  }

  async findOne(id: string): Promise<Option<Omit<User, 'password'>>> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return Err('User not found');
    } else {
      return Ok({
        email: user.email,
        id: user.id,
        username: user.username,
        role: user.role,
      });
    }
  }

  async finOneByEmail(email: string): Promise<Option<Omit<User, 'password'>>> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return Err('User not found');
    } else {
      return Ok({
        email: user.email,
        id: user.id,
        username: user.username,
        role: user.role,
      });
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
