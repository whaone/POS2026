import { UsersRepository } from './users.repository';
import { User } from '../../db/schema/user.schema';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    findByEmail(email: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    getUserPermissions(userId: string): Promise<string[]>;
}
