export declare const PREDEFINED_PERMISSIONS: readonly [{
    readonly code: "sale.create";
    readonly description: "Create sales transactions";
}, {
    readonly code: "sale.view";
    readonly description: "View sales transactions";
}, {
    readonly code: "sale.void";
    readonly description: "Void sales transactions";
}, {
    readonly code: "sale.discount";
    readonly description: "Apply discounts";
}, {
    readonly code: "sale.return";
    readonly description: "Process sales returns";
}, {
    readonly code: "product.create";
    readonly description: "Create products";
}, {
    readonly code: "product.view";
    readonly description: "View products";
}, {
    readonly code: "product.edit";
    readonly description: "Edit products";
}, {
    readonly code: "product.delete";
    readonly description: "Delete products";
}, {
    readonly code: "stock.view";
    readonly description: "View stock";
}, {
    readonly code: "stock.adjust";
    readonly description: "Adjust stock";
}, {
    readonly code: "stock.transfer";
    readonly description: "Transfer stock";
}, {
    readonly code: "customer.create";
    readonly description: "Create customers";
}, {
    readonly code: "customer.view";
    readonly description: "View customers";
}, {
    readonly code: "customer.edit";
    readonly description: "Edit customers";
}, {
    readonly code: "report.view";
    readonly description: "View reports";
}, {
    readonly code: "report.export";
    readonly description: "Export reports";
}, {
    readonly code: "user.create";
    readonly description: "Create users";
}, {
    readonly code: "user.view";
    readonly description: "View users";
}, {
    readonly code: "user.edit";
    readonly description: "Edit users";
}, {
    readonly code: "user.delete";
    readonly description: "Delete users";
}, {
    readonly code: "business.edit";
    readonly description: "Edit business settings";
}, {
    readonly code: "shift.open";
    readonly description: "Open cash register shift";
}, {
    readonly code: "shift.close";
    readonly description: "Close cash register shift";
}];
export declare const PREDEFINED_ROLES: {
    readonly admin: {
        readonly name: "Admin";
        readonly permissions: readonly ["sale.create", "sale.view", "sale.void", "sale.discount", "sale.return", "product.create", "product.view", "product.edit", "product.delete", "stock.view", "stock.adjust", "stock.transfer", "customer.create", "customer.view", "customer.edit", "report.view", "report.export", "user.create", "user.view", "user.edit", "user.delete", "business.edit", "shift.open", "shift.close"];
    };
    readonly cashier: {
        readonly name: "Cashier";
        readonly permissions: readonly ["sale.create", "sale.view", "product.view", "stock.view", "customer.create", "customer.view", "shift.open", "shift.close"];
    };
};
