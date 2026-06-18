import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { RolesService } from './roles.service';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { CommissionAgentsService } from './commission-agents.service';
import { CommissionAgentsController } from './commission-agents.controller';
import { PayrollsService } from './payrolls.service';
import { PayrollsController } from './payrolls.controller';

@Module({
  controllers: [
    ExpensesController,
    CommissionAgentsController,
    PayrollsController,
  ],
  providers: [
    UsersService,
    UsersRepository,
    RolesService,
    ExpensesService,
    CommissionAgentsService,
    PayrollsService,
  ],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
