import { Controller } from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { UsersService } from '../../users/services/users.service';

@Controller('project-users')
export class ProjectUsersController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly userService: UsersService,
  ) {}
}
