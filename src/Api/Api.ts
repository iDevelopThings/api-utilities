import type {DataTransferObject} from "../Dto";
import {AddErrorHandler, BrowserConsolePrevention, Http, ResponseErrorHandler} from "./Http";
import {RequestMethod} from "./RequestMethod";
import {ManyResolver} from "./Resolver/ManyResolver";
import {OneResolver} from "./Resolver/OneResolver";
import {UnknownResolver} from "./Resolver/UnknownResolver";
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

		if (config?.maxRetries) {
			this._http.setMaxRetries(config.maxRetries);
		}

		if (config?.calledFromBrowserConsole?.check) {
			this._http.setBrowserConsoleConfig(config.calledFromBrowserConsole);
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

	private unknownRequest<M extends DataTransferObject<any>>(method: RequestMethod, endpoint: string, data: object = {}) {
		return new UnknownResolver<M>(this._http, null, ApiResponse).request(method, endpoint, data);
	}

	get<M extends DataTransferObject<any>>(endpoint: string, data: object = {}) {
		return this.unknownRequest(RequestMethod.GET, endpoint, data);
	}

	delete<M extends DataTransferObject<any>>(endpoint: string, data: object = {}) {
		return this.unknownRequest<M>(RequestMethod.DELETE, endpoint, data);
	}

	head<M extends DataTransferObject<any>>(endpoint: string, data: object = {}) {
		return this.unknownRequest<M>(RequestMethod.HEAD, endpoint, data);
	}

	options<M extends DataTransferObject<any>>(endpoint: string, data: object = {}) {
		return this.unknownRequest<M>(RequestMethod.OPTIONS, endpoint, data);
	}

	post<M extends DataTransferObject<any>>(endpoint: string, data: object = {}) {
		return this.unknownRequest<M>(RequestMethod.POST, endpoint, data);
	}

	put<M extends DataTransferObject<any>>(endpoint: string, data: object = {}) {
		return this.unknownRequest<M>(RequestMethod.PUT, endpoint, data);
	}

	patch<M extends DataTransferObject<any>>(endpoint: string, data: object = {}) {
		return this.unknownRequest<M>(RequestMethod.PATCH, endpoint, data);
	}

	public setMainErrorHandler(shouldThrow: boolean, handler: ResponseErrorHandler): this {
		this._http.setMainErrorHandler(handler, shouldThrow);

		return this;
	}

	public addErrorHandler(handlerInfo: AddErrorHandler): this {
		this._http.addErrorHandler(handlerInfo);

		return this;
	}
}

export type ConfigurationOptions = {
	baseUrl?: string;
	headers?: { [key: string]: string },
	/**
	 * If a value is specified, when a response status is not >= 200 and <= 300, we will retry the request up to this maximum count.
	 */
	maxRetries?: number;
	/**
	 * If specified, we'll attempt to prevent http requests from the browser console.
	 * This can be useful in some applications that use global code which is accessible via the "window" object.
	 *
	 * If "check" is set to true, we'll prevent console calls when `process.env.NODE_ENV` var is included in "disallowedNodeEnvs"
	 */
	calledFromBrowserConsole?: BrowserConsolePrevention;
}

