import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '../entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Err, Ok, Option } from '../../types/option';
import { UsersService } from '../../users/services/users.service';
import { ProjectUser } from '../entities/project-user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectUser)
    private readonly projectUserRepository: Repository<ProjectUser>,
    private readonly userService: UsersService,
  ) {}

  async create({
    name,
    referringEmployeeId,
  }: CreateProjectDto): Promise<Option<Project>> {
    const referringEmployee =
      await this.userService.findOne(referringEmployeeId);

    if (referringEmployee.isErr()) {
      return Err('Could not create new Project\n' + referringEmployee.error);
    }

    const project = new Project({
      name,
      referringEmployee: referringEmployee.content,
    });
    let savedProject: Project;

    try {
      savedProject = await this.projectRepository.save(project);
    } catch (error) {
      return Err('Could not create project');
    }

    return Ok(savedProject);
  }

  async findAll(): Promise<Option<Array<Project>>> {
    try {
      const projects = await this.projectRepository.find({
        relations: { referringEmployee: true },
      });

      return Ok(projects);
    } catch (error) {
      return Err('Could not find projects');
    }
  }

  async findAllFor(id: string): Promise<Option<Array<Project>>> {
    try {
      const projectsUser = await this.projectUserRepository.find({
        where: { userId: id },
        relations: {
          project: { referringEmployee: true },
        },
      });

      const projects = projectsUser.map((projectUser) => projectUser.project);

      return Ok(projects);
    } catch (error) {
      return Err('Could not find projects');
    }
  }

  async findOne(id: string): Promise<Option<Project>> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id },
        relations: { referringEmployee: true },
      });

      if (!project) {
        return Err('Could not find project');
      }

      return Ok(project);
    } catch (error) {
      return Err('Could not find project');
    }
  }

  async findOneFor(
    userId: string,
    projectId: string,
  ): Promise<Option<Project>> {
    try {
      const projectUser = await this.projectUserRepository.findOne({
        where: { userId, projectId },
        relations: {
          project: { referringEmployee: true },
        },
      });

      if (!projectUser) {
        return Err('Could not find project');
      }

      const project = projectUser.project;

      return Ok(project);
    } catch (error) {
      return Err('Could not find projects');
    }
  }

  update(id: number) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }

  async projectExist(id: string): Promise<boolean> {
    const project = await this.projectRepository.exist({
      where: { id },
    });

    return project;
  }
}
