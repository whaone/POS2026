import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
export declare const DATABASE_TOKEN = "DATABASE_CONNECTION";
export declare class DatabaseModule implements OnApplicationBootstrap, OnApplicationShutdown {
    onApplicationBootstrap(): void;
    onApplicationShutdown(): Promise<void>;
}
