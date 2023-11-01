import { Module, ValidationPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { IsProjectManager } from '../users/guards/isProjectManager.guard.';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [IsProjectManager, UsersModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: 'APP_PIPE',
      useValue: new ValidationPipe({
        transform: true,
      }),
    },
  ],
})
export class ProjectsModule {}
