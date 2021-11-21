import type {AxiosResponse} from "axios";
import type {DtoProperty} from "../../index";
import {Validator} from "../../Dto/Validator";
import type {DataTransferObject} from "../../Dto";

export class ApiResponse<T extends DataTransferObject<any>, R> {

	protected dto: new () => T;
	protected response: AxiosResponse;
	protected _validationErrors: Validator<T> = new Validator();

	constructor(dto?: new () => T, response: AxiosResponse = null) {
		if (dto) {
			this.dto = dto;
		}

		if (response) {
			this.response = response;
			this.setValidationErrors();
		}
	}

	/**
	 * Get the data returned by the api request
	 *
	 * @returns {{[p: string]: any}}
	 */
	get data(): { [key: string]: any } {
		return this?.response?.data as { [key: string]: any } || {};
	}

	/**
	 * Will return true if our response code is not >= 200 and < 300
	 *
	 * @returns {boolean}
	 */
	get isError(): boolean {
		return !this.isSuccessful;
	}

	/**
	 * Will return true if our response code is >= 200 and < 300
	 * @returns {boolean}
	 */
	get isSuccessful(): boolean {
		return this?.response?.status >= 200 && this?.response?.status < 300;
	}

	/**
	 * Returns an instance of the model we originally wanted to create
	 *
	 * @returns {R}
	 */
	get(): R {
		if (!this.dto) {
			return this?.response?.data as R;
		}

		return (this.dto as any).create(this?.response?.data);
	}

	/**
	 * Did our response return a 422? This is the usual validation error response code.
	 *
	 * @returns {boolean}
	 */
	get isUnprocessableEntityResponse(): boolean {
		return this?.response?.status === 422;
	}

	/**
	 * Will return true if our response code is 422
	 *
	 * @returns {boolean}
	 */
	get hasValidationErrors(): boolean {
		return this.validationErrors().hasErrors();
	}

	protected setValidationErrors() {
		if (this.isUnprocessableEntityResponse && this?.data?.data) {
			this._validationErrors.setValidationErrorsFromResponse(this?.data?.data);
		}
	}

	/**
	 * If we have validation errors, we can use this to get all validation errors as key -> value object
	 * @returns {{[p: string]: string}}
	 */
	validationErrors(): Validator<T> {
		return this._validationErrors;
	}

	/**
	 * Get a specific validation error by key
	 * Returns null if it doesnt exist
	 *
	 * @param {E} key
	 * @returns {string | null}
	 */
	validationError(key: DtoProperty<T>): string | null {
		return this._validationErrors.get(key);
	}

	/**
	 * Reset all of the stored validation errors
	 */
	clearValidationErrors() {
		this._validationErrors.clear();
	}

	/**
	 * Check if we have a validation error for the specified key
	 *
	 * @param {E} key
	 * @returns {boolean}
	 */
	hasValidationError(key: DtoProperty<T>): boolean {
		return this._validationErrors.has(key);
	}

	get retryCount(): number {
		return ((this?.response as any)?.config?.retries?.retryCount || 0);
	}

	get didRetry(): boolean {
		return this.retryCount > 0;
	}

	get lastRequestTime(): number {
		return (this?.response as any)?.config?.retries?.lastRequestTime || null;
	}

	get statusCode(): number {
		return this?.response?.status;
	}
}
