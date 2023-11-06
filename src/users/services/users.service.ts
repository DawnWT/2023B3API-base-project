import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { QueryFailedError, Repository, TypeORMError } from 'typeorm';
import { Err, Ok, Option } from '../../types/option';
import { CreateUserDto } from '../dto/signup.dto';
import { CleanUser } from '../types/utility';
import {
  UserAlreadyExistException,
  UserNotFoundException,
} from '../types/error';
import {
  BaseError,
  DatabaseInternalError,
  UnknownError,
} from '../../types/error';
import * as dayjs from 'dayjs';

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

  async userIsAvailableForProject(
    id: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Option<boolean, UserNotFoundException | BaseError>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: { projectsUser: true },
        select: { projectsUser: { startDate: true, endDate: true } },
      });

      if (!user) {
        return Err(new UserNotFoundException());
      }

      const { projectsUser } = user;

      for (const pj of projectsUser) {
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

  async userIsAvailableForEvent(
    id: string,
    date: Date,
  ): Promise<Option<boolean, UserNotFoundException | BaseError>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: { events: true },
        select: { events: { date: true, eventType: true } },
      });

      if (!user) {
        return Err(new UserNotFoundException());
      }

      const parsedDate = dayjs(date);

      let lastWeek = 0;

      for (const event of user.events) {
        const parsedEventDate = dayjs(event.date);

        if (parsedDate.isSame(parsedEventDate, 'day')) {
          return Ok(false);
        }

        // if (event.eventType === 'PaidLeave') {
        if (parsedDate.isSame(parsedEventDate, 'week')) lastWeek++;

        if (lastWeek === 3) return Ok(false);
        // }
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
