import {plainToClass} from "class-transformer";
import type {DataTransferObject} from "../../../Dto";
import {LaravelApiResponse} from "./LaravelApiResponse";
import {LaravelPaginatedDto} from "./LaravelPaginatedDto";

export class LaravelPaginatedApiResponse<T extends DataTransferObject<any>> extends LaravelApiResponse<T, LaravelPaginatedDto<T>> {

	/**
	 * Returns an instance of the model we originally wanted to create
	 *
	 * @returns {LaravelPaginatedDto<T>}
	 */
	get(): LaravelPaginatedDto<T> {
		const data      = (this.dto as any).create((this.response.data as any).data);
		const paginated = plainToClass<LaravelPaginatedDto<T>, { [key: string]: any }>(LaravelPaginatedDto, this.response.data as object);

		paginated.data = data;

		return paginated;
	}

}
