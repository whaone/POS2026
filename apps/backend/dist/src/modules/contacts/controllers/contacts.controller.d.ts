import { ContactsService } from '../services/contacts.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import type { RequestWithUser } from '../../auth/auth.types';
export declare class ContactsController {
    private readonly contactsService;
    constructor(contactsService: ContactsService);
    create(req: RequestWithUser, createContactDto: CreateContactDto): Promise<{
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
    findAll(req: RequestWithUser): Promise<{
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
    findOne(req: RequestWithUser, id: string): Promise<{
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
    update(req: RequestWithUser, id: string, updateContactDto: UpdateContactDto): Promise<{
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
    remove(req: RequestWithUser, id: string): Promise<{
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
