export interface JwtPayload {
    sub: string;
    email: string;
    businessId: string;
    locationId?: string;
}
export interface AuthUser extends JwtPayload {
    name: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface RequestWithUser extends Request {
    user: JwtPayload;
}
