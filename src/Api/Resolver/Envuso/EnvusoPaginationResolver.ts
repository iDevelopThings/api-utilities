import type {DataTransferObject} from "../../../Dto";
import type {Http} from "../../Http";
import {ApiResponseResolver} from "../../Response/ApiResponseResolver";
import {EnvusoPaginatedApiResponse} from "../../Response/Envuso/EnvusoPaginatedApiResponse";
import type {EnvusoPaginatedDto} from "../../Response/Envuso/EnvusoPaginatedDto";

export class EnvusoPaginationResolver<T extends DataTransferObject<any>> extends ApiResponseResolver<T, EnvusoPaginatedDto<T>> {

	constructor(
		protected _http: Http,
		protected dto: new () => T,
	) { super(_http, dto, 'many', EnvusoPaginatedApiResponse); }

}
