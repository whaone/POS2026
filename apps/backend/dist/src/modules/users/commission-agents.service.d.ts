import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateCommissionAgentDto, UpdateCommissionAgentDto } from './dto/commission-agent.dto';
export declare class CommissionAgentsService {
    private readonly db;
    constructor(db: NodePgDatabase);
    create(businessId: string, dto: CreateCommissionAgentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        userId: string;
        rate: number;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        businessId: string;
        userId: string;
        rate: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(businessId: string, id: string): Promise<{
        id: string;
        businessId: string;
        userId: string;
        rate: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(businessId: string, id: string, dto: UpdateCommissionAgentDto): Promise<{
        id: string;
        businessId: string;
        userId: string;
        rate: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(businessId: string, id: string): Promise<{
        success: boolean;
    }>;
}
