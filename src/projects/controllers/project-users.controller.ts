import { Controller } from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { UsersService } from '../../users/services/users.service';
import { ProjectUsersService } from '../services/project-users.service';

@Controller('project-users')
export class ProjectUsersController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectsUserService: ProjectUsersService,
    private readonly userService: UsersService,
  ) {}
}
