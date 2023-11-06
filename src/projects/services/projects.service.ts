import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '../entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TypeORMError } from 'typeorm';
import { Err, Ok, Option } from '../../types/option';
import { UsersService } from '../../users/services/users.service';
import {
  UserNotAllowedException,
  UserNotFoundException,
} from '../../users/types/error';
import {
  BaseError,
  DatabaseInternalError,
  UnknownError,
} from '../../types/error';
import { ProjectNotFoundException } from '../types/error';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly userService: UsersService,
  ) {}

  async create({
    name,
    referringEmployeeId,
  }: CreateProjectDto): Promise<
    Option<Project, UserNotFoundException | UserNotAllowedException | BaseError>
  > {
    const referringEmployee =
      await this.userService.findOne(referringEmployeeId);

    if (referringEmployee.isErr()) {
      return referringEmployee;
    }

    if (referringEmployee.content.role !== 'ProjectManager') {
      return Err(new UserNotAllowedException());
    }

    const project = new Project({
      name,
      referringEmployee: referringEmployee.content,
    });

    try {
      const savedProject = await this.projectRepository.save(project);

      return Ok(savedProject);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async findAll(): Promise<Option<Array<Project>, BaseError>> {
    try {
      const projects = await this.projectRepository.find({
        relations: { referringEmployee: true },
      });

      return Ok(projects);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async findAllFor(id: string): Promise<Option<Array<Project>, BaseError>> {
    try {
      const projects = await this.projectRepository.find({
        where: { projectsUser: { userId: id } },
        relations: { referringEmployee: true },
      });

      return Ok(projects);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async findOne(
    id: string,
  ): Promise<Option<Project, ProjectNotFoundException | BaseError>> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id },
        relations: { referringEmployee: true },
      });

      if (!project) {
        return Err(new ProjectNotFoundException());
      }

      return Ok(project);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async findOneFor(
    userId: string,
    projectId: string,
  ): Promise<Option<Project, ProjectNotFoundException | BaseError>> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId, projectsUser: { userId } },
        relations: { referringEmployee: true },
      });

      if (!project) {
        return Err(new ProjectNotFoundException());
      }

      return Ok(project);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }
}
