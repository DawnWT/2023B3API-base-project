import { Module, ValidationPipe } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { IsAuth } from './guards/is-auth.guard';
import { IsAdmin } from './guards/is-admin.guard';
import { IsProjectManager } from './guards/is-project-manager.guard';
import { Project } from '../projects/entities/project.entity';
import { ProjectUser } from '../projects/entities/project-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Project, ProjectUser]),
    JwtModule.register({}),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    IsAuth,
    IsAdmin,
    IsProjectManager,
    {
      provide: 'APP_PIPE',
      useValue: new ValidationPipe({
        transform: true,
      }),
    },
  ],
  exports: [IsAuth, IsAdmin, IsProjectManager, UsersService],
})
export class UsersModule {}
