export declare class CreatePayrollDto {
    userId: string;
    period: string;
    amount: number;
    note?: string;
}
declare const UpdatePayrollDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreatePayrollDto>>;
export declare class UpdatePayrollDto extends UpdatePayrollDto_base {
}
export {};
