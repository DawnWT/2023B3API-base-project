import { Injectable } from '@nestjs/common';
import { Event } from '../entities/event.entity';
import {
  BaseError,
  DatabaseInternalError,
  UnknownError,
} from '../../types/error';
import { Err, Ok, Option } from '../../types/option';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TypeORMError } from 'typeorm';
import { EventNotFoundException } from '../types/error';
import { CreateEventDto } from '../dto/create-event.dto';
import {
  UserNotAvailableException,
  UserNotFoundException,
} from '../../users/types/error';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly userService: UsersService,
  ) {}

  async create(
    createEventDto: CreateEventDto & { userId: string },
  ): Promise<
    Option<Event, UserNotFoundException | UserNotAvailableException | BaseError>
  > {
    const parsedDate = new Date(createEventDto.date);

    const userIsAvailable = await this.userService.userIsAvailableForEvent(
      createEventDto.userId,
      parsedDate,
    );

    if (userIsAvailable.isErr()) {
      return userIsAvailable;
    }

    if (!userIsAvailable.content) {
      return Err(new UserNotAvailableException());
    }

    const user = await this.userService.findOne(createEventDto.userId);

    if (user.isErr()) {
      return user;
    }

    const event = new Event({ ...createEventDto, date: parsedDate });

    try {
      const savedEvent = await this.eventRepository.save(event);

      return Ok(savedEvent);
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
  ): Promise<Option<Event, EventNotFoundException | BaseError>> {
    try {
      const event = await this.eventRepository.findOne({ where: { id } });

      if (!event) {
        return Err(new EventNotFoundException());
      }

      return Ok(event);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async findAll(): Promise<Option<Array<Event>, BaseError>> {
    try {
      const events = await this.eventRepository.find();

      return Ok(events);
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
