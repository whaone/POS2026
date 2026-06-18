import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import { contacts, contactLedgers } from '../../../db/schema/contact.schema';
import { CreateContactDto } from '../dto/create-contact.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(@Inject('DB_CLIENT') private readonly db: NodePgDatabase) {}

  async create(businessId: string, createContactDto: CreateContactDto) {
    const [contact] = await this.db
      .insert(contacts)
      .values({
        businessId,
        type: createContactDto.type,
        name: createContactDto.name,
        phone: createContactDto.phone,
        email: createContactDto.email,
        payTermDays: createContactDto.payTermDays,
        creditLimit: createContactDto.creditLimit || 0,
        openingBalance: createContactDto.openingBalance || 0,
      })
      .returning();

    // If there's an opening balance, record it in ledger
    if (contact.openingBalance > 0) {
      // For supplier, opening balance means we owe them (credit)
      // For customer, opening balance means they owe us (debit)
      const isSupplier = ['supplier', 'both'].includes(contact.type);

      await this.db.insert(contactLedgers).values({
        contactId: contact.id,
        refType: 'opening_balance',
        debit: !isSupplier ? contact.openingBalance : 0,
        credit: isSupplier ? contact.openingBalance : 0,
        balance: contact.openingBalance,
      });
    }

    return contact;
  }

  async findAll(businessId: string) {
    return this.db
      .select()
      .from(contacts)
      .where(eq(contacts.businessId, businessId));
  }

  async findOne(businessId: string, id: string) {
    const [contact] = await this.db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.businessId, businessId)));

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async update(
    businessId: string,
    id: string,
    updateContactDto: UpdateContactDto,
  ) {
    const [updated] = await this.db
      .update(contacts)
      .set({
        ...updateContactDto,
        updatedAt: new Date(),
      })
      .where(and(eq(contacts.id, id), eq(contacts.businessId, businessId)))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return updated;
  }

  async remove(businessId: string, id: string) {
    const [deleted] = await this.db
      .delete(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.businessId, businessId)))
      .returning();

    if (!deleted) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return deleted;
  }
}
