import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    create(createBusinessDto: CreateBusinessDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        timezone: string;
        financialYearStartMonth: number;
        profitMargin: number;
        taxNumber: string | null;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        timezone: string;
        financialYearStartMonth: number;
        profitMargin: number;
        taxNumber: string | null;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        timezone: string;
        financialYearStartMonth: number;
        profitMargin: number;
        taxNumber: string | null;
    }>;
    update(id: string, updateBusinessDto: UpdateBusinessDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        timezone: string;
        financialYearStartMonth: number;
        profitMargin: number;
        taxNumber: string | null;
    }>;
    remove(id: string): Promise<void>;
}
