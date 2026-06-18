"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiresApproval = exports.APPROVAL_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.APPROVAL_KEY = 'requiresApproval';
const RequiresApproval = (permission) => (0, common_1.SetMetadata)(exports.APPROVAL_KEY, permission);
exports.RequiresApproval = RequiresApproval;
//# sourceMappingURL=requires-approval.decorator.js.map