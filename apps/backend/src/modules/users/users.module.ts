import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { RolesService } from './roles.service';

@Module({
  providers: [UsersService, UsersRepository, RolesService],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
