import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectUser } from './project-user.entity';
import { CreateProjectDto } from '../dto/create-project.dto';

@Entity()
export class Project {
  constructor(datas: CreateProjectDto) {
    Object.assign(this, datas);
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string; //au format uuidv4

  @Column({ type: 'text' })
  public name!: string;

  @Column({ type: 'uuid' })
  public referringEmployeeId!: Array<string>; //au format uuidv4

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.projectId)
  public ProjectUser!: ProjectUser[];
}
