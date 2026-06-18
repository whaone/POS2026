export declare class CreateExpenseDto {
    locationId: string;
    category: string;
    amount: number;
    accountId?: string;
    note?: string;
}
declare const UpdateExpenseDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateExpenseDto>>;
export declare class UpdateExpenseDto extends UpdateExpenseDto_base {
}
export {};
