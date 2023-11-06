import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from '../services/events.service';
import { IsAuth } from '../../users/guards/is-auth.guard';
import { CreateEventDto } from '../dto/create-event.dto';
import { Request, Response } from 'express';
import { Payload } from '../../types/payload';
import { GetEventDto } from '../dto/get-event.dto';
import { Roles } from '../../users/decorators/roles.decorator';
import { ValidateDto } from '../dto/validate.dto';
import { DeclineDto } from '../dto/decline.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(IsAuth)
  @Post()
  async create(
    @Body() createEventDto: CreateEventDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id } = req['token'] as Payload;

    const event = await this.eventsService.create({
      ...createEventDto,
      userId: id,
    });

    if (event.isErr()) {
      if (event.error.type === 'UserNotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).send('User not found');
      }

      if (event.error.type === 'UserNotAvailableException') {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send('An Event already exist for this date');
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res.status(HttpStatus.CREATED).send(event.content);
  }

  @UseGuards(IsAuth)
  @Get()
  async findAll(@Res() res: Response) {
    const events = await this.eventsService.findAll();

    if (events.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res.status(HttpStatus.OK).send(events.content);
  }

  @UseGuards(IsAuth)
  @Get('/:id')
  async findOne(@Param() { id }: GetEventDto, @Res() res: Response) {
    const event = await this.eventsService.findOne(id);

    if (event.isErr()) {
      if (event.error.type === 'EventNotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).send('Event not found');
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res.status(HttpStatus.OK).send(event.content);
  }

  @Roles('Admin', 'ProjectManager')
  @UseGuards(IsAuth)
  @Post('/:id/validate')
  async validate(
    @Param() { id: eventId }: ValidateDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: managerId, role } = req['token'] as Payload;

    const event = await this.eventsService.validate(eventId, managerId, role);

    if (event.isErr()) {
      if (event.error.type === 'EventNotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).send('Event not found');
      }

      if (event.error.type === 'CantUpdateEventException') {
        return res.status(HttpStatus.UNAUTHORIZED).send("Can't update event");
      }

      return (
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          // .send('Internal server error');
          .send(event.error.message)
      );
    }

    return res.status(HttpStatus.OK).send({ affectedLines: event.content });
  }

  @Roles('Admin', 'ProjectManager')
  @UseGuards(IsAuth)
  @Post('/:id/decline')
  async decline(
    @Param() { id: eventId }: DeclineDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: managerId, role } = req['token'] as Payload;

    const event = await this.eventsService.decline(eventId, managerId, role);

    if (event.isErr()) {
      if (event.error.type === 'EventNotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).send('Event not found');
      }

      if (event.error.type === 'CantUpdateEventException') {
        return res.status(HttpStatus.UNAUTHORIZED).send("Can't update event");
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res.status(HttpStatus.OK).send({ affectedLines: event.content });
  }
}
