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

      const parsedStartDate = dayjs(startDate);
      const parsedEndDate = dayjs(endDate);

      for (const pj of projectsUser) {
        const pjParsedStartDate = dayjs(pj.startDate);
        const pjParsedEndDate = dayjs(pj.endDate);

        if (
          (parsedStartDate.isAfter(pjParsedStartDate) &&
            parsedStartDate.isBefore(pjParsedEndDate)) ||
          (parsedEndDate.isAfter(pjParsedStartDate) &&
            parsedEndDate.isBefore(pjParsedEndDate))
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

      const eventSameDay = user.events.some((e) =>
        parsedDate.isSame(dayjs(e.date), 'day'),
      );

      if (eventSameDay) {
        return Ok(false);
      }

      const eventSameWeek = user.events.filter(
        (e) =>
          e.eventType === 'PaidLeave' &&
          parsedDate.isSame(dayjs(e.date), 'week'),
      );

      if (eventSameWeek.length > 1) {
        return Ok(false);
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

  async getMealVouchers(
    id: string,
    month: number,
  ): Promise<Option<number, UserNotFoundException | BaseError>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: { events: true },
      });

      if (!user) {
        return Err(new UserNotFoundException());
      }

      const parsedEvents = user.events.filter(
        (e) =>
          e.eventStatus === 'Accepted' &&
          dayjs(new Date(e.date)).month() - 1 === month,
      );

      const mealVoucherValue = 8;
      let mealVouchersCount = parsedEvents.length * -1;

      const djsMonth = dayjs().month(month - 1);

      const daysInMonth = djsMonth.daysInMonth();
      const firstDay = djsMonth.day();

      const days = new Array<number>(daysInMonth)
        .fill(0)
        .map((_, i) => (firstDay + i) % 7);

      mealVouchersCount += days.reduce(
        (acc, day) => (day !== 0 ? (day !== 6 ? acc + 1 : acc) : acc),
        0,
      );

      return Ok(mealVouchersCount * mealVoucherValue);
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
