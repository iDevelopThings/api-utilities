import type {AxiosRequestConfig, AxiosResponse} from "axios";
import type {DataTransferObject} from "../../Dto";
import type {Http} from "../Http";
import {RequestMethod} from "../RequestMethod";
import type {ApiResponse} from "./ApiResponse";

export class ApiResponseResolver<T extends DataTransferObject<any>, R> {

	public throwOnError: boolean = false;

	constructor(
		protected _http: Http,
		protected dto: new () => T,
		protected type: 'one' | 'many' | 'unknown' = 'one',
		protected apiResponseResolver: new (dto: new () => T, response: AxiosResponse) => ApiResponse<T, R>
	) { }

	get resolver(): new (dto: new () => T, response: AxiosResponse) => ApiResponse<T, R> {
		return this.apiResponseResolver;
	}

	public throw(shouldThrowOnError: boolean = true): ApiResponseResolver<T, R> {
		this.throwOnError = shouldThrowOnError;

		return this;
	}

	public async request(method: RequestMethod, endpoint: string, data: object = {}, config: AxiosRequestConfig = null): Promise<ApiResponse<T, R>> {
		// if (!this.dto) {
		// 	throw new Error('You first need to call "toOne(DataTransferObject)" or "toMany(DataTransferObject)" with a dto.');
		// }

		let response = null;

		try {
			if (this.type === 'one') {
				response = await this._http.one(method, endpoint, data, config);
			}
			if (this.type === 'many') {
				response = await this._http.many(method, endpoint, data, config);
			}
			if (this.type === 'unknown') {
				response = await this._http.request(method, endpoint, data, config);
			}
		} catch (error) {
			if (error?.response && !this.throwOnError) {
				return new this.apiResponseResolver(this.dto, error.response);
			}

			throw error;
		}

		return new this.apiResponseResolver(this.dto, response);
	}

	async get(endpoint: string, data: object = {}, config: AxiosRequestConfig = null): Promise<ApiResponse<T, R>> {
		return this.request(RequestMethod.GET, endpoint, data, config);
	}

	async post(endpoint: string, data: object = {}, config: AxiosRequestConfig = null): Promise<ApiResponse<T, R>> {
		return this.request(RequestMethod.POST, endpoint, data, config);
	}

	async put(endpoint: string, data: object = {}, config: AxiosRequestConfig = null): Promise<ApiResponse<T, R>> {
		return this.request(RequestMethod.PUT, endpoint, data, config);
	}

	async patch(endpoint: string, data: object = {}, config: AxiosRequestConfig = null): Promise<ApiResponse<T, R>> {
		return this.request(RequestMethod.PATCH, endpoint, data, config);
	}

	async delete(endpoint: string, data: object = {}, config: AxiosRequestConfig = null): Promise<ApiResponse<T, R>> {
		return this.request(RequestMethod.DELETE, endpoint, data, config);
	}

	async head(endpoint: string, data: object = {}, config: AxiosRequestConfig = null): Promise<ApiResponse<T, R>> {
		return this.request(RequestMethod.HEAD, endpoint, data, config);
	}

	async options(endpoint: string, data: object = {}, config: AxiosRequestConfig = null): Promise<ApiResponse<T, R>> {
		return this.request(RequestMethod.OPTIONS, endpoint, data, config);
	}

}

export type RequestOptions = {}
