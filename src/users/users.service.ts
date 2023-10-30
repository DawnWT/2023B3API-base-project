import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateUser } from './interfaces/create-user';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(userDatas: CreateUser): Promise<Omit<User, 'password'>> {
    const user = new User(userDatas);

    const { email, id, username, role } = await this.entityManager.save(user);
    return {
      email,
      id,
      username,
      role,
    };
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
