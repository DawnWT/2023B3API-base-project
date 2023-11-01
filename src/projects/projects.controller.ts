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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UsersService } from '../users/services/users.service';
import { Response } from 'express';
import { IsAdmin } from '../users/guards/isAdmin.guard';

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

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(+id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
