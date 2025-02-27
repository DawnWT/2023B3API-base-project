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
import {
  CantUpdateEventException,
  EventNotFoundException,
} from '../types/error';
import { CreateEventDto } from '../dto/create-event.dto';
import {
  UserNotAvailableException,
  UserNotFoundException,
} from '../../users/types/error';
import { UsersService } from '../../users/services/users.service';
import { UserRoles } from '../../users/types/utility';
import * as dayjs from 'dayjs';
import { ProjectNotFoundException } from '../../projects/types/error';
import { Cron } from '@nestjs/schedule';
import { writeFile } from 'fs/promises';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly userService: UsersService,
  ) {}

  private async canHandleEvent(
    eventId: string,
    managerId: string,
    managerRole: UserRoles,
  ): Promise<Option<boolean, EventNotFoundException | BaseError>> {
    if (managerRole === 'Employee') {
      return Ok(false);
    }

    try {
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
        relations: { user: { projectsUser: { project: true } } },
      });

      if (!event) {
        return Err(new EventNotFoundException());
      }

      if (event.eventStatus !== 'Pending') {
        return Ok(false);
      }

      const parsedEventDate = dayjs(new Date(event.date));

      if (managerRole === 'ProjectManager') {
        const projectFromManager = event.user.projectsUser
          .map((pu) =>
            pu.project.referringEmployeeId === managerId ? pu : null,
          )
          .filter((pu) => {
            if (pu === null) return false;

            const parsedStartDate = dayjs(new Date(pu.startDate));
            const parsedEndDate = dayjs(new Date(pu.endDate));

            return (
              (parsedStartDate.isBefore(parsedEventDate) ||
                parsedStartDate.isSame(parsedEventDate)) &&
              (parsedEndDate.isAfter(parsedEventDate) ||
                parsedEndDate.isSame(parsedEventDate))
            );
          });

        if (projectFromManager.length > 0) {
          return Ok(true);
        }
      } else {
        const haveProjects = event.user.projectsUser.some((pu) => {
          const parsedStartDate = dayjs(new Date(pu.startDate));
          const parsedEndDate = dayjs(new Date(pu.endDate));

          return (
            (parsedStartDate.isBefore(parsedEventDate) ||
              parsedStartDate.isSame(parsedEventDate)) &&
            (parsedEndDate.isAfter(parsedEventDate) ||
              parsedEndDate.isSame(parsedEventDate))
          );
        });

        if (haveProjects) {
          return Ok(true);
        }
      }

      return Ok(false);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  private async userIsAvailable(
    userId: string,
    date: Date,
  ): Promise<Option<boolean, BaseError>> {
    try {
      const events = await this.eventRepository.find({
        where: { userId },
        select: { date: true, eventType: true },
      });

      const parsedDate = dayjs(date);

      const eventSameDay = events.some((e) =>
        parsedDate.isSame(dayjs(e.date), 'day'),
      );

      if (eventSameDay) {
        return Ok(false);
      }

      const eventSameWeek = events.filter(
        (e) =>
          e.eventType === 'RemoteWork' &&
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

  async create(
    createEventDto: CreateEventDto & { userId: string },
  ): Promise<
    Option<Event, UserNotAvailableException | UserNotFoundException | BaseError>
  > {
    const userIsAvailable = await this.userIsAvailable(
      createEventDto.userId,
      createEventDto.date,
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

    const event = new Event(createEventDto);

    if (createEventDto.eventType === 'RemoteWork') {
      event.eventStatus = 'Accepted';
    }

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

  async validate(
    eventId: string,
    managerId: string,
    managerRole: UserRoles,
  ): Promise<
    Option<
      number,
      EventNotFoundException | CantUpdateEventException | BaseError
    >
  > {
    const canHandle = await this.canHandleEvent(
      eventId,
      managerId,
      managerRole,
    );

    if (canHandle.isErr()) {
      return canHandle;
    }

    if (!canHandle.content) {
      return Err(new CantUpdateEventException());
    }

    try {
      const updatedResult = await this.eventRepository.update(
        { id: eventId },
        { eventStatus: 'Accepted' },
      );

      return Ok(updatedResult.affected);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async decline(
    eventId: string,
    managerId: string,
    managerRole: UserRoles,
  ): Promise<
    Option<
      number,
      EventNotFoundException | CantUpdateEventException | BaseError
    >
  > {
    const canHandle = await this.canHandleEvent(
      eventId,
      managerId,
      managerRole,
    );

    if (canHandle.isErr()) {
      return canHandle;
    }

    if (!canHandle.content) {
      return Err(new CantUpdateEventException());
    }

    try {
      const updatedResult = await this.eventRepository.update(
        { id: eventId },
        { eventStatus: 'Declined' },
      );

      return Ok(updatedResult.affected);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async createCsv(): Promise<
    Option<string, BaseError | ProjectNotFoundException>
  > {
    try {
      const month = new Date().getMonth() + 1;
      const events = await this.eventRepository
        .createQueryBuilder('event')
        .where(`EXTRACT(MONTH FROM event.date) = :month`, { month })
        .andWhere('event.eventStatus = :eventStatus', {
          eventStatus: 'Accepted',
        })
        .andWhere('event.eventType = :eventType', { eventType: 'PaidLeave' })
        .leftJoinAndSelect('event.user', 'user')
        .leftJoinAndSelect('user.projectsUser', 'projectsUser')
        .leftJoinAndSelect('projectsUser.project', 'project')
        .getMany();

      console.log(events);

      let content = 'Date,User id,User name,Event Id,Project Id,Project name\n';

      for (const event of events) {
        console.log(event.user);
        console.log(event.user.projectsUser);

        const parsedEventDate = dayjs(new Date(event.date));
        const projectUser = event.user.projectsUser.find((pu) => {
          const parsedStartDate = dayjs(new Date(pu.startDate));
          const parsedEndDate = dayjs(new Date(pu.endDate));

          return (
            (parsedStartDate.isBefore(parsedEventDate) ||
              parsedStartDate.isSame(parsedEventDate)) &&
            (parsedEndDate.isAfter(parsedEventDate) ||
              parsedEndDate.isSame(parsedEventDate))
          );
        });

        console.log(projectUser);

        if (!projectUser) {
          return Err(new ProjectNotFoundException());
        }

        const project = projectUser.project;

        const line = `${event.date},${event.user.id},${event.user.username},${event.id},${project.id},${project.name}\n`;

        content += line;
      }

      return Ok(content);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  @Cron('0 0 0 25 * *')
  async handleCron() {
    const date = new Date(Date.now());
    const csv = await this.createCsv();

    if (csv.isErr()) {
      const { error } = csv;

      await writeFile(
        `Congés - ${date.getMonth() + 1}/${date.getFullYear()}.csv`,
        error.message,
      );

      return;
    }

    await writeFile(
      `Congés - ${date.getMonth() + 1}/${date.getFullYear()}.csv`,
      csv.content,
    );
  }
}
