import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '../../db/schema/user.schema';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.usersRepository.findById(id);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    return this.usersRepository.getUserPermissions(userId);
  }
}
