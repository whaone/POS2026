import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import type { JwtPayload } from '../auth/auth.types';
export declare class LocationController {
    private readonly locationService;
    constructor(locationService: LocationService);
    create(user: JwtPayload, createLocationDto: CreateLocationDto): Promise<{
        name: string;
        type: string;
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
    }>;
    findAll(user: JwtPayload): Promise<{
        name: string;
        type: string;
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
    }[]>;
    findOne(user: JwtPayload, id: string): Promise<{
        name: string;
        type: string;
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
    }>;
    update(user: JwtPayload, id: string, updateLocationDto: UpdateLocationDto): Promise<{
        name: string;
        type: string;
        id: string;
        businessId: string;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
    }>;
    remove(user: JwtPayload, id: string): Promise<void>;
}
