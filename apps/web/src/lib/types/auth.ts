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

export interface LoginResponse {
	user: AuthUser;
	tokens: AuthTokens;
}

export interface ApiError {
	statusCode: number;
	message: string;
	error: string;
}
