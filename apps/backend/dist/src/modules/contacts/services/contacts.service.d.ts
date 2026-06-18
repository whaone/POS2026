import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
export declare class ContactsService {
    private readonly db;
    constructor(db: NodePgDatabase);
    create(businessId: string, createContactDto: CreateContactDto): Promise<{
        name: string;
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        openingBalance: number;
        email: string | null;
        phone: string | null;
        payTermDays: number | null;
        creditLimit: number;
    }>;
    findAll(businessId: string): Promise<{
        id: string;
        businessId: string;
        type: string;
        name: string;
        phone: string | null;
        email: string | null;
        payTermDays: number | null;
        creditLimit: number;
        openingBalance: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(businessId: string, id: string): Promise<{
        id: string;
        businessId: string;
        type: string;
        name: string;
        phone: string | null;
        email: string | null;
        payTermDays: number | null;
        creditLimit: number;
        openingBalance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(businessId: string, id: string, updateContactDto: UpdateContactDto): Promise<{
        id: string;
        businessId: string;
        type: string;
        name: string;
        phone: string | null;
        email: string | null;
        payTermDays: number | null;
        creditLimit: number;
        openingBalance: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(businessId: string, id: string): Promise<{
        name: string;
        type: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        businessId: string;
        openingBalance: number;
        email: string | null;
        phone: string | null;
        payTermDays: number | null;
        creditLimit: number;
    }>;
}
