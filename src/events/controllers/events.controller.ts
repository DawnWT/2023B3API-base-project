import {
  Body,
  Controller,
  HttpStatus,
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
}
