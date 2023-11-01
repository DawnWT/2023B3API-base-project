import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Err, Ok, Option } from '../types/option';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
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

  findAll() {
    return `This action returns all projects`;
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
}
