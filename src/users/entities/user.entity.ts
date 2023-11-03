import {
  Column,
  DeepPartial,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectUser } from '../../projects/entities/project-user.entity';

@Entity()
export class User {
  constructor(datas: DeepPartial<User>) {
    Object.assign(this, datas);
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string; // au format uuidv4

  @Column({ unique: true, type: 'text' })
  public username!: string; // cette propriété doit porter une contrainte d'unicité

  @Column({ unique: true, type: 'text' })
  public email!: string; // cette propriété doit porter une contrainte d'unicité

  @Column({ type: 'text', select: false })
  public password!: string;

  @Column({
    type: 'text',
    enum: ['Employee', 'Admin', 'ProjectManager'],
    default: 'Employee',
  })
  public role?: 'Employee' | 'Admin' | 'ProjectManager'; // valeur par defaut : 'Employee'

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.user)
  public projectUser: ProjectUser[];
}
