import type {DataTransferObject} from "../../../Dto";
import {ApiResponse} from "../ApiResponse";

export class LaravelApiResponse<T extends DataTransferObject<any>, R> extends ApiResponse<T, R> {

	/**
	 * Returns an instance of the model we originally wanted to create
	 *
	 * @returns {R}
	 */
	get(): R {
		return (this.dto as any).create(this.response.data);
	}

	protected setValidationErrors() {
		if (!this.isUnprocessableEntityResponse || !this?.data?.errors) {
			return;
		}

		this._validationErrors.setValidationErrorsFromResponse(this?.data?.errors || {});
	}
}
