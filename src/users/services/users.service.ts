import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Err, Ok, Option } from '../../types/option';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(userDatas: Omit<User, 'id'>): Promise<Option<User>> {
    const user = new User(userDatas);
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

  removeProps<T extends keyof typeof User.prototype>(
    user: User,
    ...props: Array<T>
  ): Omit<User, T> {
    for (const prop of props) {
      delete user[prop];
    }

    return user;
  }
}
