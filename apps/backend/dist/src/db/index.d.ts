export declare function initDb(config: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}): import("drizzle-orm/node-postgres").NodePgDatabase<Record<string, unknown>> & {
    $client: import("drizzle-orm/node-postgres").NodePgClient;
};
export declare function getDb(): import("drizzle-orm/node-postgres").NodePgDatabase<Record<string, unknown>> & {
    $client: import("drizzle-orm/node-postgres").NodePgClient;
};
export declare function closeDb(): Promise<void>;
