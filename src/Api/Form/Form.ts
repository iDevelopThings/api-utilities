import type {AxiosRequestConfig} from "axios";
import type {ValidatorOptions} from "class-validator/types/validation/ValidatorOptions";
import {ValidationErrors} from "../../Dto";
import type {DataTransferObject} from "../../Dto";
import {Validator} from "../../Dto";
import type {DtoProperties, DtoProperty} from "../../index";
import type {Api} from "../Api";
import {RequestMethod} from "../RequestMethod";
import type {ApiResponse} from "../Response/ApiResponse";

export type FormProxiedDto<D extends DataTransferObject<any>,
	A extends Api,
	R extends ApiResponse<D, D>> = Form<D, A, R> & Omit<D, 'validate' | 'instance'>;

//export type DtoPropertyKeys<D> = DtoProperties<D>
//export type ValidationErrorsObject<D> = { [K in DtoProperties<D>]: string };

export class Form<D extends DataTransferObject<any>, A extends Api, R extends ApiResponse<D, D>> {

	/**
	 * The api extender we're using
	 *
	 * @template A
	 * @type {A}
	 * @private
	 */
	private _api: A = null;

	/**
	 * Our api response from calling {@see submit()}
	 *
	 * @template R
	 * @type {R}
	 * @private
	 */
	private _response: R;
	private _axiosRequestConfig: AxiosRequestConfig = null;

	/**
	 * The endpoint we will send a request too
	 *
	 * @type {string}
	 * @private
	 */
	private _endpoint: string = null;

	/**
	 * The method we'll use to submit the request
	 *
	 * @type {RequestMethod}
	 * @private
	 */
	private _method: RequestMethod = RequestMethod.GET;

	/**
	 * The DTO we are "wrapping" a pending request for
	 *
	 * @template T
	 * @type {T}
	 * @private
	 */
	private _proxiedDto: D = null;

	private _defaultDtoValues: Partial<D>;

	/**
	 * Has the request been submitted yet?
	 *
	 * @type {boolean}
	 * @private
	 */
	private _processing: boolean = false;

	private _wasSuccessful: boolean = false;

	private _recentlySuccessful: boolean    = false;
	private _recentlySuccessfulTimeout: any = null;

	private _validationErrors: Validator<D> = new Validator();

	constructor(
		dto?: (new() => D) | D,
		endpoint?: string,
		api?: A,
		apiResponseType?: new() => R,
		method: RequestMethod      = RequestMethod.POST,
		config: AxiosRequestConfig = null,
	) {
		this._method = method;

		if (dto) {
			this._proxiedDto       = typeof dto === 'function' ? new dto() : dto;
			this._defaultDtoValues = this._proxiedDto.getDefaultValues();
		}
		if (endpoint) {
			this._endpoint = endpoint;
		}
		if (api) {
			this._api = api;
		}
		if (config) {
			this._axiosRequestConfig = config;
		}
		if (apiResponseType) {
			this._response = new apiResponseType();
		}
	}

	/**
	 * This should not be called externally, it's used by internals
	 * to return a proxied version of the Form class & model
	 *
	 * @internal
	 * @returns {FormProxiedDto<D, A, R>}
	 */
	instance(): FormProxiedDto<D, A, R> {
		const proxy = new Proxy<Form<D, A, R>>(this, {
			get : this._proxyGet.bind(this),
			has : this._proxyHas.bind(this),
			set : this._proxySet.bind(this),
		});

		return proxy as FormProxiedDto<D, A, R>;
	}

	/**
	 * Change the request method
	 *
	 * @param {RequestMethod} method
	 * @returns {this<D, A, R>}
	 */
	public method(method: RequestMethod) {
		this._method = method;

		return this;
	}

	private resetSubmitValues() {
		this._processing                = false;
		this._wasSuccessful             = false;
		this._recentlySuccessfulTimeout = null;
	}

	/**
	 * Handle some data transformation without directly
	 * using `form.username` for example
	 *
	 * @param {(dto: D) => D} transformer
	 * @returns {this}
	 */
	public transform(transformer: (dto: D) => D): this {
		return this.set(transformer(this._proxiedDto));
	}

	/**
	 * Set a dto instance which is being used for the form.
	 *
	 * Could be useful if you create a form from a class instance
	 * then you want to provide some dto obtained via api request or something.
	 *
	 * @param {D} dto
	 * @returns {this}
	 */
	public set(dto: D): this {
		this._proxiedDto = dto;

		return this;
	}

	/**
	 * Submit your form api request
	 *
	 * @param {AxiosRequestConfig} config
	 * @returns {Promise<void>}
	 */
	public async submit(config: AxiosRequestConfig = null) {
		if (this._processing) {
			return false;
		}

		this.resetSubmitValues();

		this._processing = true;

		try {
			const axiosConfig = {...(this._axiosRequestConfig || {}), ...(config || {})};

			this._response = await this._api
				.one((this._proxiedDto.constructor as any))
				.request(this._method, this._endpoint, this._proxiedDto, axiosConfig) as unknown as R;

			if (this._response.isSuccessful) {
				this._wasSuccessful             = true;
				this._recentlySuccessful        = true;
				this._recentlySuccessfulTimeout = setTimeout(() => this._recentlySuccessful = false, 2000);
				this._processing                = false;

				return true;
			}

			if (this._response.hasValidationErrors) {
				this._validationErrors.setValidationErrorsFromResponse(
					this._response.validationErrorStore().all(), false
				);
			}

		} catch (error) {
			console.error(error);
		}

		this._processing = false;

		return false;
	}

	/**
	 * Run the dtos validation client side
	 *
	 * Validation error store will be cleared when called.
	 * If there are any validation errors already in the store, they will be cleared so new ones can potentially take their place.
	 *
	 * @param {string[] | null} groups
	 * @param classValidatorOptions
	 * @returns {boolean}
	 */
	public validate(groups: string[] | null = null, classValidatorOptions: ValidatorOptions = {}) {
		this._validationErrors.clear();

		try {
			this._proxiedDto.validate(groups, classValidatorOptions);

			return true;
		} catch (error) {
			if (error instanceof ValidationErrors) {
				this._validationErrors.setValidationErrorsFromDto(error);

				return false;
			}

			console.error('Something went wrong during dto validation....');
			console.error(error);
		}

		return false;
	}

	/**
	 * Get a key -> value object of validation errors
	 *
	 * @returns {ValidationErrorsObject<D>>}
	 */
	public errors(): { [key: string]: string } {
		return this._validationErrors.all();
	}

	/**
	 * Do we have a validation error for the DTO property specified?
	 *
	 * @param {DtoProperty<D>} key
	 * @returns {boolean}
	 */
	public hasError(key: DtoProperty<D>): boolean {
		return this._validationErrors.has(key);
	}

	/**
	 * Get the error for the specified dto key if any
	 *
	 * @param {DtoProperty<D>} key
	 * @returns {string}
	 */
	public error(key: DtoProperty<D>): string | null {
		return this._validationErrors.get(key);
	}

	/**
	 * Do we have any validation errors at all?
	 *
	 * @returns {boolean}
	 */
	public hasErrors(): boolean {
		return this._validationErrors.hasErrors();
	}

	/**
	 * Clear all validation errors from the response
	 */
	public clearErrors() {
		this._validationErrors.clear();
	}

	/**
	 * Reset all fields or the specified fields
	 *
	 * @param {DtoProperty<D>} fields
	 */
	public reset(...fields: DtoProperty<D>[]) {
		if (!fields?.length) {
			for (let defaultDtoValuesKey in this._defaultDtoValues) {
				this._proxiedDto[defaultDtoValuesKey] = this._defaultDtoValues[defaultDtoValuesKey];
			}

			return;
		}

		fields.forEach(field => {
			this._proxiedDto[field] = this._defaultDtoValues[field];
		});
	}

	/**
	 * Get the updated DTO data from the response
	 *
	 * @returns {D}
	 */
	get(): D {
		if (!this._response) {
			return null;
		}

		return this._response.get();
	}

	/**
	 * Get the api response
	 *
	 * @returns {R}
	 */
	get response() {
		return this._response;
	}

	/**
	 * Is the form request currently processing(waiting for a response?)
	 *
	 * @returns {boolean}
	 */
	get processing() {
		return this._processing;
	}

	/**
	 * Was our request successful (status code 200)
	 * @returns {boolean}
	 */
	get wasSuccessful() {
		return this._wasSuccessful;
	}

	/**
	 * Was our request in the last 2000ms successfully
	 *
	 * This is useful for displaying a success message that will disappear in 2s or so.
	 *
	 * @returns {boolean}
	 */
	get wasRecentlySuccessful() {
		return this._recentlySuccessful;
	}

	private _proxyGet(target: Form<D, A, R>, p: string | symbol, receiver: any): any {
		const t = target._proxyHasProperty(target, p);

		if (t === null) {
			return undefined;
		}

		switch (t) {
			case "form":
				return target[p];
			case "dto":
				return target._proxiedDto[p];
			default:
				return undefined;
		}
	}

	private _proxyHas(target: Form<D, A, R>, p: string | symbol): boolean {
		return this._proxyHasProperty(target, p) !== null;
	}

	private _proxySet(target: Form<D, A, R>, p: string | symbol, value: any, receiver: any): boolean {
		const t = target._proxyHasProperty(target, p);

		if (t === null) {
			return false;
		}

		switch (t) {
			case "form":
				target[p] = value;
				return true;
			case "dto":
				target._proxiedDto[p] = value;
				return true;
			default:
				return false;
		}

	}

	private _proxyHasProperty(target: Form<D, A, R>, p: string | symbol): 'dto' | 'form' | null {

		if (p in target._proxiedDto && !target._isIgnoredDtoProperty(p as string)) {
			return 'dto';
		}

		if (p in target) {
			return 'form';
		}

		return null;
	}

	private _isIgnoredDtoProperty(key: string) {
		return this._ignoreDtoProperties().includes(key);
	}

	private _ignoreDtoProperties() {
		return ['validate'];
	}
}
