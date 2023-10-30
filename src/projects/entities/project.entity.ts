import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectUser } from './project-user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  public id!: string; //au format uuidv4

  @Column({ type: 'text' })
  public name!: string;

  @Column({ type: 'uuid' })
  public referringEmployeeId!: Array<string>; //au format uuidv4

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.projectId)
  public ProjectUser!: ProjectUser[];
}
