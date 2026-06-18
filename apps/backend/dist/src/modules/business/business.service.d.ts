import { Business } from '../../db/schema/business.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { RolesService } from '../users/roles.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
export declare class BusinessService {
    private readonly db;
    private readonly rolesService;
    constructor(db: NodePgDatabase, rolesService: RolesService);
    create(createBusinessDto: CreateBusinessDto): Promise<Business>;
    findAll(): Promise<Business[]>;
    findOne(id: string): Promise<Business>;
    update(id: string, updateBusinessDto: UpdateBusinessDto): Promise<Business>;
    remove(id: string): Promise<void>;
}
