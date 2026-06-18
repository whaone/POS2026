export declare enum LocationType {
    STORE = "store",
    WAREHOUSE = "warehouse"
}
export declare class CreateLocationDto {
    name: string;
    type?: LocationType;
    address?: string;
}
