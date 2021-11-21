import {plainToInstance} from "class-transformer";
import type {DataTransferObject} from "../../../Dto";
import {EnvusoApiResponse} from "./EnvusoApiResponse";
import {EnvusoPaginatedDto} from "./EnvusoPaginatedDto";


export class EnvusoPaginatedApiResponse<T extends DataTransferObject<any>, R extends EnvusoPaginatedDto<T>> extends EnvusoApiResponse<T, R> {

	/**
	 * Returns an instance of the model we originally wanted to create
	 *
	 * @returns {R}
	 */
	get(): R {
		const data      = (this.dto as any).create((this.response.data as any).data);
		const paginated = plainToInstance<EnvusoPaginatedDto<T>, { [key: string]: any }>(EnvusoPaginatedDto, this.response.data as object);

		paginated.data = data;

		return paginated as R;
	}

}
