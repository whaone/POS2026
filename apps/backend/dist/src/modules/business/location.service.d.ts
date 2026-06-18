import { Location } from '../../db/schema/location.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
export declare class LocationService {
    private readonly db;
    constructor(db: NodePgDatabase);
    create(businessId: string, createLocationDto: CreateLocationDto): Promise<Location>;
    findAllByBusiness(businessId: string): Promise<Location[]>;
    findOne(businessId: string, id: string): Promise<Location>;
    update(businessId: string, id: string, updateLocationDto: UpdateLocationDto): Promise<Location>;
    remove(businessId: string, id: string): Promise<void>;
}
