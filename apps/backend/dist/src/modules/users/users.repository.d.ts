import { User, NewUser } from '../../db/schema/user.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
export declare class UsersRepository {
    private readonly db;
    constructor(db: NodePgDatabase);
    findByEmail(email: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    create(data: NewUser): Promise<User>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
    getUserPermissions(userId: string): Promise<string[]>;
}
