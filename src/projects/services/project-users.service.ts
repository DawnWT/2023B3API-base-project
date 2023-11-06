import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectUser } from '../entities/project-user.entity';
import { Repository, TypeORMError } from 'typeorm';
import { UsersService } from '../../users/services/users.service';
import { CreateProjectUserDto } from '../dto/create-project-user.dto';
import { Option, Err, Ok } from '../../types/option';
import { ProjectsService } from './projects.service';
import {
  ProjectNotFoundException,
  ProjectUserNotFoundException,
} from '../types/error';
import {
  BaseError,
  DatabaseInternalError,
  UnknownError,
} from '../../types/error';
import {
  UserNotAvailableException,
  UserNotFoundException,
} from '../../users/types/error';
import * as dayjs from 'dayjs';

@Injectable()
export class ProjectUsersService {
  constructor(
    @InjectRepository(ProjectUser)
    private readonly projectUserRepository: Repository<ProjectUser>,
    private readonly projectService: ProjectsService,
    private readonly userService: UsersService,
  ) {}

  private async userIsAvailable(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Option<boolean, BaseError>> {
    try {
      const projectsUser = await this.projectUserRepository.find({
        where: { userId },
        select: { startDate: true, endDate: true },
      });

      const parsedStartDate = dayjs(startDate);
      const parsedEndDate = dayjs(endDate);

      for (const pj of projectsUser) {
        const pjParsedStartDate = dayjs(pj.startDate);
        const pjParsedEndDate = dayjs(pj.endDate);

        if (
          (parsedStartDate.isAfter(pjParsedStartDate) &&
            parsedStartDate.isBefore(pjParsedEndDate)) ||
          (parsedEndDate.isAfter(pjParsedStartDate) &&
            parsedEndDate.isBefore(pjParsedEndDate))
        ) {
          return Ok(false);
        }
      }

      return Ok(true);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async create({
    projectId,
    userId,
    startDate,
    endDate,
  }: CreateProjectUserDto): Promise<
    Option<
      ProjectUser,
      | ProjectNotFoundException
      | UserNotFoundException
      | UserNotAvailableException
      | BaseError
    >
  > {
    const userIsAvailable = await this.userIsAvailable(
      userId,
      startDate,
      endDate,
    );

    if (userIsAvailable.isErr()) {
      return userIsAvailable;
    }

    if (!userIsAvailable.content) {
      return Err(new UserNotAvailableException());
    }

    const user = await this.userService.findOne(userId);
    if (user.isErr()) {
      return user;
    }

    const project = await this.projectService.findOne(projectId);
    if (project.isErr()) {
      return project;
    }

    const projectUser = new ProjectUser({
      startDate: startDate,
      endDate: endDate,
      project: project.content,
      user: user.content,
    });

    try {
      const savedProjectUser =
        await this.projectUserRepository.save(projectUser);

      return Ok(savedProjectUser);
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
  ): Promise<Option<ProjectUser, ProjectUserNotFoundException | BaseError>> {
    try {
      const projectUser = await this.projectUserRepository.findOne({
        where: { id },
      });

      if (!projectUser) {
        return Err(new ProjectUserNotFoundException());
      }

      return Ok(projectUser);
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
    projectUserId: string,
  ): Promise<Option<ProjectUser, ProjectUserNotFoundException | BaseError>> {
    try {
      const projectUser = await this.projectUserRepository.findOne({
        where: { id: projectUserId, userId },
      });

      if (!projectUser) {
        return Err(new ProjectUserNotFoundException());
      }

      return Ok(projectUser);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async findAll(): Promise<Option<Array<ProjectUser>, BaseError>> {
    try {
      const projectUsers = await this.projectUserRepository.find({
        relations: { project: true },
      });

      return Ok(projectUsers);
    } catch (error) {
      if (error instanceof TypeORMError) {
        return Err(new DatabaseInternalError(error));
      }

      if (error instanceof Error) {
        return Err(new UnknownError(error));
      }
    }
  }

  async findAllFor(
    userId: string,
  ): Promise<Option<Array<ProjectUser>, BaseError>> {
    try {
      const projectUsers = await this.projectUserRepository.find({
        where: { userId },
        relations: { project: true },
      });

      return Ok(projectUsers);
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
