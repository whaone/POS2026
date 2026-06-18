import { SetMetadata } from '@nestjs/common';

export const APPROVAL_KEY = 'requiresApproval';
export const RequiresApproval = (permission: string) =>
  SetMetadata(APPROVAL_KEY, permission);
