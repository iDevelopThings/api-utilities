import type {DataTransferObject} from "../../../Dto";
import {ApiResponse} from "../ApiResponse";

export class EnvusoApiResponse<T extends DataTransferObject<any>, R> extends ApiResponse<T, R> {

	/**
	 * Returns an instance of the model we originally wanted to create
	 *
	 * @returns {R}
	 */
	get(): R {
//		return (this.dto as any).create(this.response.data);

		const dto = (this.dto as any).create(this?.response?.data);

		dto.validator = this._validationErrors;

		return dto;
	}

}
