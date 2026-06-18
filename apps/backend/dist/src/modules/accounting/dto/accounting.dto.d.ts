declare enum AccountType {
    CASH = "cash",
    BANK = "bank",
    EWALLET = "ewallet",
    OTHER = "other"
}
export declare class CreateAccountDto {
    name: string;
    type: AccountType;
    openingBalance?: number;
}
declare const UpdateAccountDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateAccountDto>>;
export declare class UpdateAccountDto extends UpdateAccountDto_base {
}
export {};
