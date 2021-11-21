import type {AxiosRequestConfig} from "axios";
import type {DataTransferObject} from "../../Dto";
import {Api, ConfigurationOptions} from "../Api";
import {Form, FormProxiedDto} from "../Form/Form";
import {RequestMethod} from "../RequestMethod";
import {EnvusoPaginationResolver} from "../Resolver/Envuso/EnvusoPaginationResolver";
import {ManyResolver} from "../Resolver/ManyResolver";
import {OneResolver} from "../Resolver/OneResolver";
import {EnvusoApiResponse} from "../Response/Envuso/EnvusoApiResponse";

export class EnvusoApi extends Api {

	static create(config: ConfigurationOptions) {
		const api = new EnvusoApi();

		api.setConfig(config);

		return api;
	}

	toMany<M extends DataTransferObject<any>>(dto: new () => M): ManyResolver<M> {
		return new ManyResolver<M>(this._http, dto, EnvusoApiResponse);
	}

	toOne<M extends DataTransferObject<any>>(dto: new () => M): OneResolver<M> {
		return new OneResolver<M>(this._http, dto, EnvusoApiResponse);
	}

	public paginated<M extends DataTransferObject<any>>(dto: { new(): M }): EnvusoPaginationResolver<M> {
		return new EnvusoPaginationResolver<M>(this._http, dto);
	}

	public form<M extends DataTransferObject<any>>(
		dto: (new () => M) | M,
		method: RequestMethod      = RequestMethod.POST,
		endpoint: string,
		config: AxiosRequestConfig = null,
	): FormProxiedDto<M, EnvusoApi, EnvusoApiResponse<M, M>> {
		return new Form<M, EnvusoApi, EnvusoApiResponse<M, M>>(dto, endpoint, this, EnvusoApiResponse, method, config).instance();
	}
}
