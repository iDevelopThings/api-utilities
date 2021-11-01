import type {DataTransferObject} from "../Dto";
import {Http} from "./Http";
import {ManyResolver} from "./Resolver/ManyResolver";
import {OneResolver} from "./Resolver/OneResolver";
import {ApiResponse} from "./Response/ApiResponse";

export class Api {

	protected _http: Http = null;

	setConfig(config: ConfigurationOptions) {
		this._http = new Http();

		if (config?.baseUrl) {
			this._http.setBaseUrl(config.baseUrl);
		}
		if (config?.headers) {
			this._http.setBaseHeaders(config.headers);
		}
	}

	static create(config: ConfigurationOptions) {
		const api = new Api();

		api.setConfig(config);

		return api;
	}

	setAuthorizationToken(token: string, prefix: string = 'Bearer') {
		this._http.setAuthorizationToken(token, prefix);
	}

	get http(): Http {
		return this._http;
	}

	asMany<M extends DataTransferObject<any>>(dto: new () => M): ManyResolver<M> {
		return this.toMany(dto);
	}

	many<M extends DataTransferObject<any>>(dto: new () => M): ManyResolver<M> {
		return this.toMany(dto);
	}

	toMany<M extends DataTransferObject<any>>(dto: new () => M): ManyResolver<M> {
		return new ManyResolver<M>(this._http, dto, ApiResponse);
	}

	asOne<M extends DataTransferObject<any>>(dto: new () => M): OneResolver<M> {
		return this.toOne(dto);
	}

	one<M extends DataTransferObject<any>>(dto: new () => M): OneResolver<M> {
		return this.toOne(dto);
	}

	toOne<M extends DataTransferObject<any>>(dto: new () => M): OneResolver<M> {
		return new OneResolver<M>(this._http, dto, ApiResponse);
	}

}

export type ConfigurationOptions = {
	baseUrl: string;
	headers?: { [key: string]: string }
}

