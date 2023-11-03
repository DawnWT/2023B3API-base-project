import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UsersService } from '../../users/services/users.service';
import { Request, Response } from 'express';
import { IsAdmin } from '../../users/guards/isAdmin.guard';
import { IsAuth } from '../../users/guards/isAuth.guard';
import { Payload } from '../../types/payload';
import { GetProjectParamsDto } from '../dto/get-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(IsAdmin)
  @Post()
  async create(
    @Body() { name, referringEmployeeId }: CreateProjectDto,
    @Res() res: Response,
  ) {
    const referringEmployeeRoleOption =
      await this.userService.getRole(referringEmployeeId);

    if (referringEmployeeRoleOption.isErr()) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Referring employee not found');
    }

    if (referringEmployeeRoleOption.content !== 'ProjectManager') {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .send('Referring employee is not a project manager');
    }

    const projectOption = await this.projectsService.create({
      name,
      referringEmployeeId,
    });

    if (projectOption.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(projectOption.error);
    }

    return res.status(HttpStatus.CREATED).json(projectOption.content);
  }

  @UseGuards(IsAuth)
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const { id, role } = req['token'] as Payload;

    if (role === 'Employee') {
      const projects = await this.projectsService.findAllFor(id);

      if (projects.isErr()) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('Une erreur est survenue');
      }

      return res.status(HttpStatus.OK).json(projects.content);
    }

    const projects = await this.projectsService.findAll();

    if (projects.isErr()) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Une erreur est survenue');
    }

    return res.status(HttpStatus.OK).json(projects.content);
  }

  @UseGuards(IsAuth)
  @Get(':id')
  async findOne(
    @Param() { id: paramId }: GetProjectParamsDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: tokenId, role } = req['token'] as Payload;

    if (role === 'Employee') {
      const project = await this.projectsService.findOneFor(tokenId, paramId);

      if (project.isErr()) {
        return res.status(HttpStatus.FORBIDDEN).send('Forbidden');
      }

      return res.status(HttpStatus.OK).json(project.content);
    }

    const project = await this.projectsService.findOne(paramId);

    if (project.isErr()) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send('This project does not exist');
    }

    return res.status(HttpStatus.OK).json(project.content);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.projectsService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
