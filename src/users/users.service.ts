import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/signup.dto';
import { genSalt, hash, compare } from 'bcrypt';
import { LoginParams } from './interfaces/auth';
import { JwtService } from '@nestjs/jwt';
import { Option } from '../types/option';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    userDatas: CreateUserDto,
  ): Promise<Option<Omit<User, 'password'>>> {
    const userExist = await this.entityManager.exists(User, {
      where: [{ email: userDatas.email }, { username: userDatas.username }],
    });

    if (userExist) {
      return {
        error: 'User already exists',
      };
    }

    const user = new User(userDatas);

    const salt = await genSalt();
    user.password = await hash(user.password, salt);

    const { email, id, username, role } = await this.entityManager.save(user);
    return {
      content: {
        email,
        id,
        username,
        role,
      },
    };
  }

  async findAll(): Promise<Array<Omit<User, 'password'>>> {
    const users = await this.usersRepository.find();

    const usersWithoutPassword = users.map((user) => ({
      username: user.username,
      id: user.id,
      email: user.email,
      role: user.role,
    }));

    return usersWithoutPassword;
  }

  async findOne(id: string): Promise<Option<Omit<User, 'password'>>> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      return { error: 'User not found' };
    } else {
      return {
        content: {
          email: user.email,
          id: user.id,
          username: user.username,
          role: user.role,
        },
      };
    }
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async login({
    email,
    password,
  }: LoginParams): Promise<Option<{ access_token: string }>> {
    const user = await this.entityManager.findOne(User, { where: { email } });

    if (!user) {
      return { error: 'User not found' };
    }

    const isMatch = await compare(password, user.password);

    if (isMatch) {
      const payload = { username: user.username, sub: user.id };
      return {
        content: {
          access_token: this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
          }),
        },
      };
    } else {
      return { error: 'Wrong password' };
    }
  }
}
