import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CreateUserDto } from '../dto/signup.dto';

@Entity()
export class User {
  constructor(datas: CreateUserDto) {
    Object.assign(this, datas);
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string; // au format uuidv4

  @Column({ unique: true, type: 'text' })
  public username!: string; // cette propriété doit porter une contrainte d'unicité

  @Column({ unique: true, type: 'text' })
  public email!: string; // cette propriété doit porter une contrainte d'unicité

  @Column({ type: 'text' })
  public password!: string;

  @Column({
    type: 'text',
    enum: ['Employee', 'Admin', 'ProjectManager'],
    default: 'Employee',
  })
  public role?: 'Employee' | 'Admin' | 'ProjectManager'; // valeur par defaut : 'Employee'
}
