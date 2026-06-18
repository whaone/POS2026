export declare class CreateCommissionAgentDto {
    userId: string;
    rate: number;
}
declare const UpdateCommissionAgentDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateCommissionAgentDto>>;
export declare class UpdateCommissionAgentDto extends UpdateCommissionAgentDto_base {
}
export {};
