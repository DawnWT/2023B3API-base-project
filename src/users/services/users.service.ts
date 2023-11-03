import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { Err, Ok, Option } from '../../types/option';
import { CreateUserDto } from '../dto/signup.dto';
import { CleanUser, UserRoles } from '../types/utility';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private cleanUser(user: User): CleanUser {
    delete user.password;

    return user;
  }

  async create(userDatas: CreateUserDto): Promise<Option<CleanUser>> {
    const user = new User(userDatas);

    const savedUser = await this.userRepository.save(user);

    const cleanUser = this.cleanUser(savedUser);

    return Ok(cleanUser);
  }

  async findAll(): Promise<Array<CleanUser>> {
    const users = await this.userRepository.find();

    return users;
  }

  async findOne(id: string): Promise<Option<CleanUser>>;
  async findOne(id: string, withPassword: false): Promise<Option<CleanUser>>;
  async findOne(id: string, withPassword: true): Promise<Option<User>>;
  async findOne(
    id: string,
    withPassword = false,
  ): Promise<Option<CleanUser | User>> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        .addSelect('user.password')
        .getOne();

      if (!user) {
        return Err('User not found');
      } else {
        if (!withPassword) {
          const cleanUser = this.cleanUser(user);

          return Ok(cleanUser);
        }

        return Ok(user);
      }
    } catch (error) {
      return Err('Could not find user');
    }
  }

  async finOneByEmail(email: string): Promise<Option<CleanUser>>;
  async finOneByEmail(
    email: string,
    withPassword: false,
  ): Promise<Option<CleanUser>>;
  async finOneByEmail(email: string, withPassword: true): Promise<Option<User>>;
  async finOneByEmail(
    email: string,
    withPassword = false,
  ): Promise<Option<CleanUser | User>> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .addSelect('user.password')
        .getOne();

      if (!user) {
        return Err('User not found');
      } else {
        if (!withPassword) {
          const cleanUser = this.cleanUser(user);

          return Ok(cleanUser);
        }

        return Ok(user);
      }
    } catch (error) {
      return Err('Could not find user');
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

  async getRole(id: string): Promise<Option<UserRoles>> {
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
