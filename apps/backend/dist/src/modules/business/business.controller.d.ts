import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    create(createBusinessDto: CreateBusinessDto): Promise<{
        name: string;
        id: string;
        currency: string;
        timezone: string;
        financialYearStartMonth: number;
        profitMargin: number;
        taxNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        currency: string;
        timezone: string;
        financialYearStartMonth: number;
        profitMargin: number;
        taxNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        currency: string;
        timezone: string;
        financialYearStartMonth: number;
        profitMargin: number;
        taxNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateBusinessDto: UpdateBusinessDto): Promise<{
        name: string;
        id: string;
        currency: string;
        timezone: string;
        financialYearStartMonth: number;
        profitMargin: number;
        taxNumber: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<void>;
}
