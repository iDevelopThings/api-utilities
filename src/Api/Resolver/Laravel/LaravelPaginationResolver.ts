import type {DataTransferObject} from "../../../Dto";
import type {Http} from "../../Http";
import {ApiResponseResolver} from "../../Response/ApiResponseResolver";
import {LaravelPaginatedApiResponse} from "../../Response/Laravel/LaravelPaginatedApiResponse";
import type {LaravelPaginatedDto} from "../../Response/Laravel/LaravelPaginatedDto";

export class LaravelPaginationResolver<T extends DataTransferObject<any>> extends ApiResponseResolver<T, LaravelPaginatedDto<T>> {

	constructor(
		protected _http: Http,
		protected dto: new () => T,
	) { super(_http, dto, 'many', LaravelPaginatedApiResponse); }

}
