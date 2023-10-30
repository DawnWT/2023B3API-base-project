import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ProjectUser {
  @PrimaryGeneratedColumn('uuid')
  public id!: string; //au format uuidv4

  @Column({ type: 'date' })
  public startDate!: Date;

  @Column({ type: 'date' })
  public endDate!: Date;

  @Column({ type: 'uuid' })
  public projectId!: string; //au format uuidv4

  @Column({ type: 'uuid' })
  public userId!: string; //au format uuidv4

  @ManyToOne(() => Project, (project) => project.ProjectUser)
  public project!: Project;

  @ManyToOne(() => User, (user) => user.ProjectUser)
  public user!: User;
}
