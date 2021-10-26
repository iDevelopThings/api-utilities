import type {DataTransferObject} from "../../Dto";
import type {ApiHandler} from "../Api";
import {Http} from "../Http";
import {RequestMethod} from "../RequestMethod";
import {ApiResponse} from "./ApiResponse";

export class ApiResponseResolver<T extends DataTransferObject<any>, R> {

	public throwOnError: boolean = false;

	constructor(
		private handler: ApiHandler<T>,
		protected dto: new () => T,
		protected type: 'one' | 'many' = 'one'
	) { }

	public throw(shouldThrowOnError: boolean = true): ApiResponseResolver<T, R> {
		this.throwOnError = shouldThrowOnError;

		return this;
	}

	private async handleRequest(method: RequestMethod, endpoint: string, data: object = {}): Promise<ApiResponse<T, R>> {
		if (!this.dto) {
			throw new Error('You first need to call "toOne(DataTransferObject)" or "toMany(DataTransferObject)" with a dto.');
		}

		let response = null;

		try {
			if (this.type === 'one') {
				response = await Http.one(method, endpoint, data);
			}
			if (this.type === 'many') {
				response = await Http.many(method, endpoint, data);
			}
		} catch (error) {
			if (error?.response && !this.throwOnError) {
				return new ApiResponse<T, R>(this.dto, error.response);
			}

			throw error;
		}

		return new ApiResponse<T, R>(this.dto, response);
	}

	async get(endpoint: string, data: object = {}): Promise<ApiResponse<T, R>> {
		return this.handleRequest(RequestMethod.GET, endpoint, data);
	}

	async post(endpoint: string, data: object = {}): Promise<ApiResponse<T, R>> {
		return this.handleRequest(RequestMethod.POST, endpoint, data);
	}

	async put(endpoint: string, data: object = {}): Promise<ApiResponse<T, R>> {
		return this.handleRequest(RequestMethod.PUT, endpoint, data);
	}

	async patch(endpoint: string, data: object = {}): Promise<ApiResponse<T, R>> {
		return this.handleRequest(RequestMethod.PATCH, endpoint, data);
	}

	async delete(endpoint: string, data: object = {}): Promise<ApiResponse<T, R>> {
		return this.handleRequest(RequestMethod.DELETE, endpoint, data);
	}

	async head(endpoint: string, data: object = {}): Promise<ApiResponse<T, R>> {
		return this.handleRequest(RequestMethod.HEAD, endpoint, data);
	}

	async options(endpoint: string, data: object = {}): Promise<ApiResponse<T, R>> {
		return this.handleRequest(RequestMethod.OPTIONS, endpoint, data);
	}

}
