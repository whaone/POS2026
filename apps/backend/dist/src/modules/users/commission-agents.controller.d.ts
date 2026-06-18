import { CommissionAgentsService } from './commission-agents.service';
import type { RequestWithUser } from '../auth/auth.types';
import { CreateCommissionAgentDto, UpdateCommissionAgentDto } from './dto/commission-agent.dto';
export declare class CommissionAgentsController {
    private readonly service;
    constructor(service: CommissionAgentsService);
    findAll(req: RequestWithUser): Promise<{
        id: string;
        businessId: string;
        userId: string;
        rate: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(req: RequestWithUser, id: string): Promise<{
        id: string;
        businessId: string;
        userId: string;
        rate: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(req: RequestWithUser, dto: CreateCommissionAgentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        userId: string;
        rate: number;
    }>;
    update(req: RequestWithUser, id: string, dto: UpdateCommissionAgentDto): Promise<{
        id: string;
        businessId: string;
        userId: string;
        rate: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(req: RequestWithUser, id: string): Promise<{
        success: boolean;
    }>;
}
