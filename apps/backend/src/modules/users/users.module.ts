import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { RolesService } from './roles.service';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';

@Module({
  controllers: [ExpensesController],
  providers: [UsersService, UsersRepository, RolesService, ExpensesService],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
