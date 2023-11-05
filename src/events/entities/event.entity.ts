import {
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Event {
  constructor(datas: DeepPartial<Event>) {
    Object.assign(this, datas);
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string; //au format uuidv4

  @Column({ type: 'date' })
  public date!: Date;

  @Column({
    type: 'text',
    enum: ['Pending', 'Accepted', 'Declined'],
    default: 'Pending',
  })
  public eventStatus?: 'Pending' | 'Accepted' | 'Declined'; // valeur par défaut : 'Pending';

  @Column({
    type: 'text',
    enum: ['RemoteWork', 'PaidLeave'],
  })
  public eventType!: 'RemoteWork' | 'PaidLeave';

  @Column({ type: 'text', nullable: true })
  public eventDescription?: string;

  @Column({ type: 'uuid' })
  public userId!: string; //au format uuidv4

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;
}
