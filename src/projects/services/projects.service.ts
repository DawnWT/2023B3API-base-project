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

  async create(createProjectDto: CreateProjectDto): Promise<Option<Project>> {
    const referringEmployeeOption = await this.userService.findOne(
      createProjectDto.referringEmployeeId,
    );

    if (referringEmployeeOption.isErr()) {
      return Err(
        'Could not create new Project\n' + referringEmployeeOption.error,
      );
    }

    const project = new Project({
      ...createProjectDto,
      referringEmployee: referringEmployeeOption.content,
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
          project: true,
        },
      });

      const projects = projectsUser.map((projectUser) => projectUser.project);

      return Ok(projects);
    } catch (error) {
      return Err('Could not find projects');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
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
