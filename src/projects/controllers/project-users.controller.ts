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
import { ProjectsService } from '../services/projects.service';
import { UsersService } from '../../users/services/users.service';
import { IsAuth } from '../../users/guards/isAuth.guard';
import { CreateProjectUserDto } from '../dto/create-project-user.dto';
import { Request, Response } from 'express';
import { Payload } from '../../types/payload';
import { ProjectUsersService } from '../services/project-users.service';
import { GetProjectUserParamDto } from '../dto/get-project-user.dto';

@Controller('project-users')
export class ProjectUsersController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectsUserService: ProjectUsersService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(IsAuth)
  @Post()
  async create(
    @Body() { startDate, endDate, projectId, userId }: CreateProjectUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { role } = req['token'] as Payload;

    if (role === 'Employee') {
      return res.status(HttpStatus.UNAUTHORIZED).send('Unauthorized');
    }

    const userExist = await this.userService.userExist({ id: userId });
    const projectExist = await this.projectsService.projectExist(projectId);

    if (!userExist) {
      return res.status(HttpStatus.NOT_FOUND).send('User not found');
    }

    if (!projectExist) {
      return res.status(HttpStatus.NOT_FOUND).send('Project not found');
    }

    const userIsAvailable = await this.userService.userIsAvailable(
      userId,
      startDate,
      endDate,
    );

    if (!userIsAvailable) {
      return res.status(HttpStatus.CONFLICT).send('User not available');
    }

    const projectUser = await this.projectsUserService.create({
      startDate,
      endDate,
      projectId,
      userId,
    });

    if (projectUser.isErr()) {
      return res.status(HttpStatus.CONFLICT).send(projectUser.error);
    }

    return res.status(HttpStatus.CREATED).send(projectUser.content);
  }

  @UseGuards(IsAuth)
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const { role, id } = req['token'] as Payload;

    if (role === 'Employee') {
      const projectUser = await this.projectsUserService.findAllFor(id);

      if (projectUser.isErr()) {
        return res.status(HttpStatus.NOT_FOUND).send('');
      }

      return res
        .status(HttpStatus.OK)
        .json(projectUser.content.map((pu) => pu.project));
    }

    const projectUser = await this.projectsUserService.findAll();

    if (projectUser.isErr()) {
      return res.status(HttpStatus.NOT_FOUND).send('');
    }

    return res
      .status(HttpStatus.OK)
      .json(projectUser.content.map((pu) => pu.project));
  }

  @UseGuards(IsAuth)
  @Get(':id')
  async findOne(
    @Param() { id: paramId }: GetProjectUserParamDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { role, id: tokenId } = req['token'] as Payload;

    if (role === 'Employee') {
      const projectUser = await this.projectsUserService.findOneFor(
        paramId,
        tokenId,
      );

      if (projectUser.isErr()) {
        return res.status(HttpStatus.NOT_FOUND).send(projectUser.error);
      }

      return res.status(HttpStatus.OK).json(projectUser.content);
    }

    const projectUser = await this.projectsUserService.findOne(paramId);

    if (projectUser.isErr()) {
      return res.status(HttpStatus.NOT_FOUND).send(projectUser.error);
    }

    return res.status(HttpStatus.OK).json(projectUser.content);
  }
}
