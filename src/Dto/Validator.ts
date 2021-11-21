import type {DtoProperty} from "../api-utils";
import type {DataTransferObject} from "./DataTransferObject";
import type {ValidationErrors} from "./ValidationErrors";

export class Validator<D extends DataTransferObject<any>> {

	private _errors: Map<keyof D, string> = new Map();

	/**
	 * Clear all errors in the store
	 */
	public clear() {
		this._errors.clear();
	}

	/**
	 * Do we have any errors right now?
	 *
	 * @returns {boolean}
	 */
	public hasErrors(): boolean {
		return this._errors.size > 0;
	}

	/**
	 * Get all validation errors as key -> value object
	 *
	 * @returns {{[K in keyof D]: string|null}}
	 */
	public all(): { [K in keyof D]: string | null } {
		return Object.fromEntries(this._errors.entries()) as { [K in keyof D]: string | null };
	}

	/**
	 * Get the error message
	 *
	 * @param {DtoProperty<D>} key
	 * @returns {string|null}
	 */
	public get<K extends keyof D>(key: DtoProperty<D>): string | null {
		return this._errors.get(key) || null;
	}

	/**
	 * Do we have a validation error for the dto property?
	 *
	 * @param {DtoProperty<D>} key
	 * @returns {boolean}
	 */
	public has<K extends keyof D>(key: DtoProperty<D>): boolean {
		return this._errors.has(key);
	}

	private setFromKeyValObject(errors: { [key: string]: string }, clearStore: boolean = true) {
		if (Object.keys(errors).length === 0) {
			return;
		}

		if (clearStore) {
			this.clear();
		}

		for (let key in errors) {
			this._errors.set(key as DtoProperty<D>, errors[key]);
		}
	}

	/**
	 * We'll parse the "formatted" errors from the ValidationErrors error and set them on the map
	 *
	 * @param {ValidationErrors} error
	 * @param clearStore
	 */
	setValidationErrorsFromDto(error: ValidationErrors, clearStore: boolean = true) {
		this.setFromKeyValObject(error.validationErrorsFormatted, clearStore);
	}

	/**
	 * We'll parse the key -> value object from the api response and set them on the map
	 *
	 * @param {{[p: string]: string}} errors
	 * @param clearStore
	 */
	setValidationErrorsFromResponse(errors: { [key: string]: string }, clearStore: boolean = true) {
		this.setFromKeyValObject(errors, clearStore);
	}

}
