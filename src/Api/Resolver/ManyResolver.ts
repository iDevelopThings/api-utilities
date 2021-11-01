import type {AxiosResponse} from "axios";
import type {DataTransferObject} from "../../Dto";
import type {Http} from "../Http";
import type {ApiResponse} from "../Response/ApiResponse";
import {ApiResponseResolver} from "../Response/ApiResponseResolver";

export class ManyResolver<T extends DataTransferObject<any>> extends ApiResponseResolver<T, T[]> {

	constructor(
		protected _http: Http,
		protected dto: new () => T,
		protected apiResponseResolver: new (dto: new () => T, response: AxiosResponse) => ApiResponse<T, T[]>
	) { super(_http, dto, 'many', apiResponseResolver); }

}
