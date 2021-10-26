import type {AxiosResponse} from "axios";
import type {DataTransferObject} from "../../Dto";

export class ApiResponse<T extends DataTransferObject<any>, R> {

	protected dto: new () => T;
	protected response: AxiosResponse;
	protected _validationErrors: { [key: string]: string } = {};

	constructor(dto: new () => T, response: AxiosResponse) {
		this.dto      = dto;
		this.response = response;

		this.setValidationErrors();
	}

	/**
	 * Get the data returned by the api request
	 *
	 * @returns {{[p: string]: any}}
	 */
	get data(): { [key: string]: any } {
		return this.response.data as { [key: string]: any };
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
		return this.response.status >= 200 && this.response.status < 300;
	}

	/**
	 * Will return true if our response code is 422
	 *
	 * @returns {boolean}
	 */
	get hasValidationErrors(): boolean {
		return this.response.status === 422;
	}

	/**
	 * Returns an instance of the model we originally wanted to create
	 *
	 * @returns {R}
	 */
	get(): R {
		return (this.dto as any).create(this.response.data);
	}

	private setValidationErrors() {
		if (this.hasValidationErrors) {
			for (let dataKey in this.data.data) {
				this._validationErrors[dataKey] = (this.data.data[dataKey] || null);
			}
		}
	}

	/**
	 * If we have validation errors, we can use this to get all validation errors as key -> value object
	 * @returns {{[p: string]: string}}
	 */
	validationErrors(): { [key: string]: string } {
		return this._validationErrors;
	}

	/**
	 * Get a specific validation error by key
	 * Returns null if it doesnt exist
	 *
	 * @param {E} key
	 * @returns {string | null}
	 */
	validationError<E extends keyof T>(key: E): string | null {
		return this._validationErrors[key as string] || null;
	}

	/**
	 * Check if we have a validation error for the specified key
	 *
	 * @param {E} key
	 * @returns {boolean}
	 */
	hasValidationError<E extends keyof T>(key: E): boolean {
		return !!this._validationErrors[key as string];
	}
}
