import type {DataTransferObject} from "../../Dto";
import {Api, ConfigurationOptions} from "../Api";
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
}
