import type {AxiosRequestConfig} from "axios";
import type {DataTransferObject} from "../../Dto";
import {Api, ConfigurationOptions} from "../Api";
import {Form, FormProxiedDto} from "../Form/Form";
import {RequestMethod} from "../RequestMethod";
import {LaravelPaginationResolver} from "../Resolver/Laravel/LaravelPaginationResolver";
import {ManyResolver} from "../Resolver/ManyResolver";
import {OneResolver} from "../Resolver/OneResolver";
import {LaravelApiResponse} from "../Response/Laravel/LaravelApiResponse";

export class LaravelApi extends Api {

	static create(config: ConfigurationOptions) {
		const api = new LaravelApi();

		api.setConfig(config);

		return api;
	}

	toMany<M extends DataTransferObject<any>>(dto: new () => M): ManyResolver<M> {
		return new ManyResolver<M>(this._http, dto, LaravelApiResponse);
	}

	toOne<M extends DataTransferObject<any>>(dto: new () => M): OneResolver<M> {
		return new OneResolver<M>(this._http, dto, LaravelApiResponse);
	}

	public paginated<M extends DataTransferObject<any>>(dto: { new(): M }): LaravelPaginationResolver<M> {
		return new LaravelPaginationResolver<M>(this._http, dto);
	}

	public form<M extends DataTransferObject<any>>(
		dto: (new () => M) | M,
		method: RequestMethod      = RequestMethod.POST,
		endpoint: string,
		config: AxiosRequestConfig = null,
	): FormProxiedDto<M, LaravelApi, LaravelApiResponse<M, M>> {
		return new Form<M, LaravelApi, LaravelApiResponse<M, M>>(dto, endpoint, this, LaravelApiResponse, method, config).instance();
	}
}
