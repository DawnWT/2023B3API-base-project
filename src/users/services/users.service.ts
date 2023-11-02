import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Err, Ok, Option } from '../../types/option';
import { CreateUserDto } from '../dto/signup.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private removeProps<T extends keyof typeof User.prototype>(
    user: User,
    ...props: Array<T>
  ): Omit<User, T> {
    for (const prop of props) {
      delete user[prop];
    }

    return user;
  }

  async create(userDatas: CreateUserDto): Promise<Option<User>> {
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
    id,
    username,
    email,
  }: {
    id?: string;
    username?: string;
    email?: string;
  }): Promise<boolean> {
    const userExist = await this.userRepository.exist({
      where: [{ username }, { email }, { id }],
    });

    return userExist;
  }

  async getRole(id: string): Promise<Option<typeof User.prototype.role>> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      return Err('User not found');
    } else {
      return Ok(user.role);
    }
  }

  async userIsAvailable(
    id: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { projectUser: true },
    });

    if (!user) {
      return false;
    }

    const { projectUser } = user;

    for (const pj of projectUser) {
      if (
        (startDate >= pj.startDate && startDate <= pj.endDate) ||
        (endDate >= pj.startDate && endDate <= pj.endDate)
      ) {
        return false;
      }
    }

    return true;
  }
}
