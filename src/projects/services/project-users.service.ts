import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../entities/project.entity';
import { ProjectUser } from '../entities/project-user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/services/users.service';
import { ProjectsService } from './projects.service';

@Injectable()
export class ProjectUsersService {
  constructor(
    @InjectRepository(ProjectUser)
    private readonly projectUserRepository: Repository<ProjectUser>,
    private readonly projectService: ProjectsService,
    private readonly userService: UsersService,
  ) {}
}
