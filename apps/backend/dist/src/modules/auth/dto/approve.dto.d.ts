export declare class ApprovalContextDto {
    resourceType?: string;
    resourceId?: string;
    reason?: string;
}
export declare class ApproveDto {
    email: string;
    password: string;
    requiredPermission: string;
    context?: ApprovalContextDto;
}
