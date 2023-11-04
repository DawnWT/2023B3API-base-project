import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { QueryFailedError, Repository, TypeORMError } from 'typeorm';
import { Err, Ok, Option } from '../../types/option';
import { CreateUserDto } from '../dto/signup.dto';
import { CleanUser, UserRoles } from '../types/utility';
import {
  UserAlreadyExistException,
  UserNotFoundException,
} from '../types/error';
import {
  BaseError,
  DatabaseInternalError,
  UnknownError,
} from '../../types/error';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private cleanUser(user: User): CleanUser {
    delete user.password;

    return user;
  }

  async create(
    userDatas: CreateUserDto,
  ): Promise<Option<CleanUser, UserAlreadyExistException | BaseError>> {
    const user = new User(userDatas);

    try {
      const savedUser = await this.userRepository.save(user);

      const cleanUser = this.cleanUser(savedUser);

      return Ok(cleanUser);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        return Err(new UserAlreadyExistException(error));
      }

      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async findAll(): Promise<Option<Array<CleanUser>, BaseError>> {
    try {
      const users = await this.userRepository.find();

      return Ok(users);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async findOne(
    id: string,
  ): Promise<Option<CleanUser, UserNotFoundException | BaseError>>;
  async findOne(
    id: string,
    withPassword: false,
  ): Promise<Option<CleanUser, UserNotFoundException | BaseError>>;
  async findOne(
    id: string,
    withPassword: true,
  ): Promise<Option<User, UserNotFoundException | BaseError>>;
  async findOne(
    id: string,
    withPassword = false,
  ): Promise<Option<CleanUser | User, UserNotFoundException | BaseError>> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        .addSelect('user.password')
        .getOne();

      if (!user) {
        return Err(new UserNotFoundException());
      } else {
        if (!withPassword) {
          const cleanUser = this.cleanUser(user);

          return Ok(cleanUser);
        }

        return Ok(user);
      }
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async finOneByEmail(
    email: string,
  ): Promise<Option<CleanUser, UserNotFoundException | BaseError>>;
  async finOneByEmail(
    email: string,
    withPassword: false,
  ): Promise<Option<CleanUser, UserNotFoundException | BaseError>>;
  async finOneByEmail(
    email: string,
    withPassword: true,
  ): Promise<Option<User, UserNotFoundException | BaseError>>;
  async finOneByEmail(
    email: string,
    withPassword = false,
  ): Promise<Option<CleanUser | User, UserNotFoundException | BaseError>> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .addSelect('user.password')
        .getOne();

      if (!user) {
        return Err(new UserNotFoundException());
      } else {
        if (!withPassword) {
          const cleanUser = this.cleanUser(user);

          return Ok(cleanUser);
        }

        return Ok(user);
      }
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
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

  async getRole(
    id: string,
  ): Promise<Option<UserRoles, UserNotFoundException | BaseError>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: { role: true },
      });

      if (!user) {
        return Err(new UserNotFoundException());
      } else {
        return Ok(user.role);
      }
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async userIsAvailable(
    id: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Option<boolean, UserNotFoundException | BaseError>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: { projectUser: true },
        select: { projectUser: { startDate: true, endDate: true } },
      });

      if (!user) {
        return Err(new UserNotFoundException());
      }

      const { projectUser } = user;

      for (const pj of projectUser) {
        if (
          (startDate >= pj.startDate && startDate <= pj.endDate) ||
          (endDate >= pj.startDate && endDate <= pj.endDate)
        ) {
          return Ok(false);
        }
      }

      return Ok(true);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }
}
