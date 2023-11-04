import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '../types/utility';

export const Roles = (...args: Array<UserRoles>) => SetMetadata('roles', args);
