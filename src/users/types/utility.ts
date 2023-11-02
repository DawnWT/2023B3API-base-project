import { User } from '../entities/user.entity';

export type CleanUser = Omit<User, 'password'>;

export type UserRoles = typeof User.prototype.role;
