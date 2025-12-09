import { ApiResponse } from "./ApiResponse";

export type LoginData = {
	accessToken: string;
	refreshToken: string;
	user: {
		id: number;
		email: string;
		fullName: string;
		address: string;
		dateOfBirth: string;
		role: string;
		linkedProviders: string[];
		emailVerified: boolean;
		positiveRatings: number;
		negativeRatings: number;
		createdAt: string;
	};
};

// export type SignupData = {
//   accessToken: string;
//   refreshToken: string;
//   user: {
//     id: number;
//     email: string;
//     fullName: string;
//     address: string;
//     dateOfBirth: string;
//     role: string;
//     linkedProviders: string[];
//     emailVerified: boolean;
//     positiveRatings: number;
//     negativeRatings: number;
//     createdAt: string;
//   };
// };

export type AccessTokenPayload = {
	sub: number;
	email: string;
	role: string;
	exp: number;
};

export type LoginResponse = ApiResponse<LoginData>;
export type SignupResponse = ApiResponse<string>;
