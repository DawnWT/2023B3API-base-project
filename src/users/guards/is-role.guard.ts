import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { Payload } from '../../types/payload';
import { Reflector } from '@nestjs/core';
import { UserRoles } from '../types/utility';

@Injectable()
export class IsRole implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request;
    const token = req['token'] as Payload;

    if (!token) {
      throw new InternalServerErrorException();
    }

    const roles = this.reflector.get<Array<UserRoles>>(
      'roles',
      context.getHandler(),
    );

    if (!roles.includes(token.role)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
