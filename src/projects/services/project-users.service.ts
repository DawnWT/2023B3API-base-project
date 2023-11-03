import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectUser } from '../entities/project-user.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../../users/services/users.service';
import { CreateProjectUserDto } from '../dto/create-project-user.dto';
import { Option, Err, Ok } from '../../types/option';
import { ProjectsService } from './projects.service';

@Injectable()
export class ProjectUsersService {
  constructor(
    @InjectRepository(ProjectUser)
    private readonly projectUserRepository: Repository<ProjectUser>,
    private readonly projectService: ProjectsService,
    private readonly userService: UsersService,
  ) {}

  async create(
    createProjectUserDto: CreateProjectUserDto,
  ): Promise<Option<ProjectUser>> {
    const { projectId, userId, startDate, endDate } = createProjectUserDto;

    const project = await this.projectService.findOne(projectId);
    if (project.isErr()) {
      return Err('Project not found');
    }

    const user = await this.userService.findOne(userId);
    if (user.isErr()) {
      return Err('User not found');
    }

    const projectUser = new ProjectUser({
      startDate,
      endDate,
      project: project.content,
      user: user.content,
    });

    try {
      const savedProjectUser =
        await this.projectUserRepository.save(projectUser);

      return Ok(savedProjectUser);
    } catch (error) {
      return Err('Could not create project-user');
    }
  }

  async findOne(id: string): Promise<Option<ProjectUser>> {
    try {
      const projectUser = await this.projectUserRepository.findOne({
        where: { id },
      });

      if (!projectUser) {
        return Err('Project-user not found');
      }

      return Ok(projectUser);
    } catch (error) {
      return Err('Could not find project-user');
    }
  }

  async findOneFor(
    projectUserId: string,
    userId: string,
  ): Promise<Option<ProjectUser>> {
    try {
      const projectUser = await this.projectUserRepository.findOne({
        where: { id: projectUserId, userId },
      });

      if (!projectUser) {
        return Err('Project-user not found');
      }

      return Ok(projectUser);
    } catch (error) {
      return Err('Could not find project-user');
    }
  }

  async findAll(): Promise<Option<Array<ProjectUser>>> {
    try {
      const projectUsers = await this.projectUserRepository.find({
        relations: { project: true },
      });

      return Ok(projectUsers);
    } catch (error) {
      return Err('Could not find project-users');
    }
  }

  async findAllFor(userId: string): Promise<Option<Array<ProjectUser>>> {
    try {
      const projectUsers = await this.projectUserRepository.find({
        where: { userId },
        relations: { project: true },
      });

      return Ok(projectUsers);
    } catch (error) {
      return Err('Could not find project-users');
    }
  }
}
