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
import { IsAuth } from '../../users/guards/is-auth.guard';
import { CreateProjectUserDto } from '../dto/create-project-user.dto';
import { Request, Response } from 'express';
import { Payload } from '../../types/payload';
import { ProjectUsersService } from '../services/project-users.service';
import { GetProjectUserDto } from '../dto/get-project-user.dto';
import { Roles } from '../../users/decorators/roles.decorator';
import { IsRole } from '../../users/guards/is-role.guard';

@Controller('project-users')
export class ProjectUsersController {
  constructor(private readonly projectUserService: ProjectUsersService) {}

  @Roles('Admin', 'ProjectManager')
  @UseGuards(IsAuth, IsRole)
  @Post()
  async create(
    @Body() { startDate, endDate, projectId, userId }: CreateProjectUserDto,
    @Res() res: Response,
  ) {
    const projectUser = await this.projectUserService.create({
      startDate,
      endDate,
      projectId,
      userId,
    });

    if (projectUser.isErr()) {
      if (projectUser.error.type === 'ProjectNotFoundException') {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send('Project with given id not found');
      }

      if (projectUser.error.type === 'UserNotFoundException') {
        return res
          .status(HttpStatus.NOT_FOUND)
          .send('User with given id not found');
      }

      if (projectUser.error.type === 'UserNotAvailableException') {
        return res.status(HttpStatus.CONFLICT).send('User not available');
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res.status(HttpStatus.CREATED).send(projectUser.content);
  }

  @UseGuards(IsAuth)
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const { role, id } = req['token'] as Payload;

    if (role === 'Employee') {
      const projectUser = await this.projectUserService.findAllFor(id);

      if (projectUser.isErr()) {
        return res.status(HttpStatus.NOT_FOUND).send('');
      }

      return res.status(HttpStatus.OK).json(projectUser.content);
    }

    const projectUser = await this.projectUserService.findAll();

    if (projectUser.isErr()) {
      return res.status(HttpStatus.NOT_FOUND).send('');
    }

    return res.status(HttpStatus.OK).json(projectUser.content);
  }

  @UseGuards(IsAuth)
  @Get(':id')
  async findOne(
    @Param() { id: paramId }: GetProjectUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { role, id: tokenId } = req['token'] as Payload;

    if (role === 'Employee') {
      const projectUser = await this.projectUserService.findOneFor(
        tokenId,
        paramId,
      );

      if (projectUser.isErr()) {
        if (projectUser.error.type === 'ProjectUserNotFoundException') {
          return res
            .status(HttpStatus.NOT_FOUND)
            .send('Project User not found');
        }

        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('Internal server error');
      }

      return res.status(HttpStatus.OK).json(projectUser.content);
    }

    const projectUser = await this.projectUserService.findOne(paramId);

    if (projectUser.isErr()) {
      if (projectUser.error.type === 'ProjectUserNotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).send('Project User not found');
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res.status(HttpStatus.OK).json(projectUser.content);
  }
}
