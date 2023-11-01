import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProjectUser } from './project-user.entity';

@Entity()
export class Project {
  constructor(datas: Omit<Project, 'id'>) {
    Object.assign(this, datas);
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string; //au format uuidv4

  @Column({ type: 'text' })
  public name!: string;

  @Column({ type: 'uuid' })
  public referringEmployeeId!: string; //au format uuidv4

  @OneToOne(() => User)
  @JoinColumn({ name: 'referringEmployeeId' })
  public referringEmployee!: User;

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project)
  public projectUser?: ProjectUser[];
}
