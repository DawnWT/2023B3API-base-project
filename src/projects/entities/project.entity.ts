import {
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProjectUser } from './project-user.entity';

@Entity()
export class Project {
  constructor(datas: DeepPartial<Project>) {
    Object.assign(this, datas);
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string; //au format uuidv4

  @Column({ type: 'text' })
  public name!: string;

  @Column({ type: 'uuid' })
  public referringEmployeeId!: string; //au format uuidv4

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referringEmployeeId' })
  public referringEmployee: User;

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project)
  public projectsUser: ProjectUser[];
}
