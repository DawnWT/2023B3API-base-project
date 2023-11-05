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

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

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
