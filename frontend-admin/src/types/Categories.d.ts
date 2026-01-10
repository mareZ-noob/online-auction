import type { ApiResponse } from "./ApiResponse";

export type CHILD_CATEGORY = {
	id: number;
	name: string;
	description: string;
	parentId: number;
	parentName: string;
};

export type CATEGORY = {
	id: number;
	name: string;
	description: string;
	parentId: number;
	children: CHILD_CATEGORY[];
};

export type CATEGORY_PAYLOAD = {
	name: string;
	description: string;
	parentId: number | null;
};

export type CATEGORY_RESPONSE = ApiResponse<CATEGORY[]>;
export type DELETE_CATEGORY_RESPONSE = ApiResponse<string>;
