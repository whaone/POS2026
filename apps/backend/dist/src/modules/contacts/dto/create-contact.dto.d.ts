declare enum ContactType {
    SUPPLIER = "supplier",
    CUSTOMER = "customer",
    BOTH = "both"
}
export declare class CreateContactDto {
    type: ContactType;
    name: string;
    phone?: string;
    email?: string;
    payTermDays?: number;
    creditLimit?: number;
    openingBalance?: number;
}
export {};
