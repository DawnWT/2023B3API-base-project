import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { IsAuth } from './isAuth.guard';
import { JwtService } from '@nestjs/jwt';
import { Payload } from '../../types/payload';

@Injectable()
export class IsAdmin extends IsAuth implements CanActivate {
  constructor(jwtService: JwtService) {
    super(jwtService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const superGuard = await super.canActivate(context);

    if (!superGuard) return superGuard;

    const req = context.switchToHttp().getRequest();

    const { role } = req['token'] as Payload;

    if (role !== 'ProjectManager') {
      throw new UnauthorizedException();
    }

    return true;
  }
}
