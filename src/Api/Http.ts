import axios, {AxiosError, AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse, Method} from "axios";
import isRetryAllowed from "../Utility/IsRetryAllowed";
import {FormUtility} from "./Form/FormUtility";

/**
 * Implemented some of the logic from axios-retry package. So retry logic deserves some credits
 * https://github.com/softonic/axios-retry
 */

export class Http {

	_token: string                      = null;
	_baseUrl: string                    = null;
	_headers: { [key: string]: string } = {
		'Content-Type' : 'application/json',
		'Accept'       : 'application/json',
	};
	_maxRetries: number                 = 0;

	private retry = {
		safeMethods : ['get', 'head', 'options'],
	};

	private _browserConsolePrevention: BrowserConsolePrevention = {check : false, disallowedNodeEnvs : []};

	private _errorHandlers: Map<string, ResponseErrorHandlingInfo> = new Map();

	private _axiosInstance: AxiosInstance = null;

	/**
	 * Uses:
	 * interceptors.request.use
	 */
	private _axiosRequestSendInterceptors: ((config: AxiosRequestConfig) => AxiosRequestConfig)[] = [];
	/**
	 * Uses:
	 * interceptors.response.use(req => THIS ONE, undefined);
	 */
	private _axiosSuccessfulResponseInterceptors: ((response: AxiosResponse) => AxiosResponse)[]  = [];
	/**
	 * Uses:
	 * interceptors.response.use(undefined, req => THIS ONE);
	 */
	private _axiosFailedResponseInterceptors: ((error) => Promise<any>)[]                         = [];

	public addRequestSendInterceptor(interceptor: (config: AxiosRequestConfig) => AxiosRequestConfig) {
		this._axiosRequestSendInterceptors.push(interceptor);

		return this;
	}

	public addSuccessfulResponseInterceptor(interceptor: (response: AxiosResponse) => AxiosResponse) {
		this._axiosSuccessfulResponseInterceptors.push(interceptor);

		return this;
	}

	public addFailedResponseInterceptor(interceptor: (error) => Promise<any>) {
		this._axiosFailedResponseInterceptors.push(interceptor);

		return this;
	}

	public setBaseUrl(url: string) {
		this._baseUrl = url;

		return this;
	}

	public setMaxRetries(maxCount: number = 0) {
		this._maxRetries = maxCount;

		return this;
	}

	public setBaseHeaders(headers: { [key: string]: string }) {
		this._headers = headers;

		return this;
	}

	public setBrowserConsoleConfig(config: BrowserConsolePrevention): this {
		if (!config.check) {
			this._browserConsolePrevention.check              = false;
			this._browserConsolePrevention.disallowedNodeEnvs = [];

			return this;
		}


		this._browserConsolePrevention.check              = config.check;
		this._browserConsolePrevention.disallowedNodeEnvs = config.disallowedNodeEnvs;

		return this;
	}

	/**
	 * Are we able to run retries if the request fails?
	 *
	 * @returns {boolean}
	 */
	public shouldDoRetries(): boolean {
		return this._maxRetries > 0;
	}

	public setAuthorizationToken(token: string, prefix: string = 'Bearer') {
		if (!token) {
			this._token = null;
			delete this._headers['Authorization'];

			return this;
		}

		this._token                    = [prefix, token].join(' ');
		this._headers['Authorization'] = this._token;

		return this;
	}

	public headers(): { [key: string]: string } {
		return this._headers;
	}

	public apiBaseUrl(): string {
		return this._baseUrl;
	}


	private _instance() {
		if (this._axiosInstance) {
			return this._axiosInstance;
		}

		this._axiosInstance = axios.create({
			baseURL         : this.apiBaseUrl(),
			headers         : this._headers,
			withCredentials : true,
		});

		this._axiosInstance.interceptors.request.use((config) => {
			// Set up handling request retries
			const currentState           = this.getCurrentState(config);
			currentState.lastRequestTime = Date.now();

			// Make sure we pass the headers, when we call setBaseHeaders() / setAuthorizationToken()
			// after initialization, the instance is already created. We can't modify it's config.
			config.headers = this._headers;

			// Run custom axios interceptors
			for (let interceptor of this._axiosRequestSendInterceptors) {
				try {
					config = interceptor(config);
				} catch (error) {
					console.error(error);
				}
			}

			return config;
		});

		this._axiosInstance.interceptors.response.use(
			(res) => {
				// Run custom axios interceptors
				for (let interceptor of this._axiosSuccessfulResponseInterceptors) {
					try {
						res = interceptor(res);
					} catch (error) {
						console.error(error);
					}
				}

				return res;
			},
			async (error) => {

				if (error?.config && this.shouldDoRetries()) {
					return await this.handleRequestRetry(error, error.config);
				}

				let handleResult = await this.handleResponseError((error as AxiosError));

				if (handleResult === true) {
					return this.isAxiosError(error) ? error.response : null;
				}

				// Run custom axios interceptors
				for (let interceptor of this._axiosFailedResponseInterceptors) {
					try {
						handleResult = await interceptor(handleResult);
					} catch (error) {
						console.error(error);
					}
				}

				return handleResult;
			}
		);

		return this._axiosInstance;
	}

	public async request<T extends any | any[]>(method: Method, endpoint: string, params: object = {}, config: AxiosRequestConfig = null): Promise<AxiosResponse<T>> {
		this.canRunRequest();

		let dataProp = 'data';
		let hasFiles = false;

		const sendDataAsQueryParams = ['GET', 'DELETE'].includes(method.toUpperCase());

		if (sendDataAsQueryParams) {
			dataProp = 'params';
		}

		if (typeof window !== 'undefined' && !sendDataAsQueryParams) {
			hasFiles = FormUtility.hasFiles(params);

			if (hasFiles) {
				params = FormUtility.objectToFormData(params);
				//TODO: Implement uploadProgress handling
			}
		}

		return this._instance().request<T>({
			...(config || {}),
			method,
			url        : endpoint,
			[dataProp] : params
		});
	}

	public async many<T extends any[]>(method: Method, endpoint: string, params: object = {}, config: AxiosRequestConfig = null): Promise<AxiosResponse<T>> {
		return this.request<T>(method, endpoint, params, config);
	}

	public async one<T extends any>(method: Method, endpoint: string, params: object = {}, config: AxiosRequestConfig = null): Promise<AxiosResponse<T>> {
		return this.request<T>(method, endpoint, params, config);
	}

	public get<T>(endpoint: string, params: object = {}, config: AxiosRequestConfig = null): Promise<any> {
		return this.request<T>('get', endpoint, {params : params}, config);
	}

	public put<T>(endpoint: string, params: object = {}, config: AxiosRequestConfig = null): Promise<any> {
		return this.request<T>('put', endpoint, params, config);
	}

	public patch<T>(endpoint: string, params: object = {}, config: AxiosRequestConfig = null): Promise<any> {
		return this.request<T>('patch', endpoint, params, config);
	}

	public post<T>(endpoint: string, params: object = {}, config: AxiosRequestConfig = null): Promise<any> {
		return this.request<T>('post', endpoint, params, config);
	}

	public delete<T>(endpoint: string, params: object = {}, config: AxiosRequestConfig = null): Promise<any> {
		return this.request<T>('delete', endpoint, {params : params}, config);
	}

	private canRunRequest() {
		if (this.calledFromConsole()) {
			throw new Error('Cannot run this request via the browser console.');
		}
	}

	/**
	 * Ensure that this method is only being called by the wrapper to make sure people aren't using
	 * our api wrapper methods via the browser console somehow.
	 */
	private calledFromConsole(): boolean {
		if (!this._browserConsolePrevention.check || this._browserConsolePrevention.disallowedNodeEnvs?.length === 0) {
			return false;
		}

		return this._browserConsolePrevention.disallowedNodeEnvs.includes(process.env.NODE_ENV)
			// @ts-ignore
			// We use ts-ignore since "keys" exists in the browser console scope...
			? (typeof keys === 'function' && keys.toString().indexOf('Command Line API') !== -1)
			: false;
	}

	/**
	 * We can set an error handler for if our request returns a status code that is not >= 200 and <= 300
	 *
	 * If a handler exists from a specific error handler specified by {@see setErrorHandling}, your handler
	 * will not be called and instead, it will be handled by that handler.
	 *
	 * This allows us to specify some "global" logic for all failed requests, but also to handle specific
	 * errors in a way that our application wants/needs.
	 *
	 * return true in your handler to essentially mark the error as "handled" and not continue any internal error handling.
	 * return false in your handler to mark it as not handled and that internal error handling should continue.
	 *
	 * @param {ResponseErrorHandler} handler
	 * @param {boolean} shouldThrow
	 */
	public setMainErrorHandler(handler: ResponseErrorHandler, shouldThrow: boolean): this {
		this._errorHandlers.set('main', {
			handler, shouldThrow
		});

		return this;
	}

	/**
	 * We can set an error handler for the specified status code
	 *
	 * An error handler registered here will not be ran by the {@see setMainErrorHandler} handler if one is specified.
	 *
	 * return true in your handler to essentially mark the error as "handled" and not continue any internal error handling.
	 * return false in your handler to mark it as not handled and that internal error handling should continue.
	 *
	 * @param {number} statusCode
	 * @param {ResponseErrorHandler} handler
	 * @param {boolean} shouldThrowError
	 */
	public addErrorHandler({statusCode, handler, shouldThrow}: AddErrorHandler): this {
		this._errorHandlers.set(statusCode.toString(), {
			shouldThrow, handler,
		});

		return this;
	}

	private isAxiosError(error: any) {
		return error?.response !== undefined;
	}

	/**
	 * Handle calling any error handlers set up
	 *
	 * This is basically an axios interceptor handler
	 *
	 * @param {AxiosError} error
	 * @returns {Promise<boolean>}
	 * @private
	 */
	private async handleResponseError(error: AxiosError) {
		let handlerInfo = this._errorHandlers.get('main');

		// If we have no main error handler & response, we can't do anything with it
		if (!handlerInfo && !error?.response) {
			return Promise.reject(error);
		}

		handlerInfo = this._errorHandlers.has(error.response?.status?.toString())
			? this._errorHandlers.get(error.response?.status?.toString())
			: this._errorHandlers.get('main');

		if (!handlerInfo) {
			return Promise.reject(error);
		}

		const result = await handlerInfo.handler(error, null);

		if (handlerInfo.shouldThrow && !result) {
			return Promise.reject(error);
		}

		return true;
	}

	/**
	 * @param  {Error}  error
	 * @return {boolean}
	 */
	private isNetworkError(error) {
		return (
			!error.response &&
			Boolean(error.code) && // Prevents retrying cancelled requests
			error.code !== 'ECONNABORTED' && // Prevents retrying timed out requests
			isRetryAllowed(error)
		); // Prevents retrying unsafe errors
	}

	/**
	 * @param  {Error}  error
	 * @return {boolean}
	 */
	private isRetryableError(error) {
		return (
			error.code !== 'ECONNABORTED' &&
			(!error?.response || (error?.response?.status >= 400 && error?.response?.status <= 599))
		);
	}

	/**
	 * Initializes and returns the retry state for the given request/config
	 * @param  {AxiosRequestConfig} config
	 * @return {Object}
	 */
	private getCurrentState(config) {
		const currentState      = config['retries'] || {};
		currentState.retryCount = currentState.retryCount || 0;
		config['retries']       = currentState;
		return currentState;
	}

	private fixRequestRetryConfig(axios, config) {
		if (axios.defaults.agent === config.agent) {
			delete config.agent;
		}
		if (axios.defaults.httpAgent === config.httpAgent) {
			delete config.httpAgent;
		}
		if (axios.defaults.httpsAgent === config.httpsAgent) {
			delete config.httpsAgent;
		}
	}

	private getRequestOptions(config, defaultOptions) {
		return {...defaultOptions, ...config['retries']};
	}

	/**
	 * Checks retryCondition if request can be retried. Handles it's retruning value or Promise.
	 * @param  {number} retries
	 * @param  {Function} retryCondition
	 * @param  {Object} currentState
	 * @param  {Error} error
	 * @return {boolean}
	 */
	private async shouldRetry(retries, retryCondition, currentState, error) {
		const shouldRetryOrPromise = currentState.retryCount < retries && retryCondition(error);

		// This could be a promise
		if (typeof shouldRetryOrPromise === 'object') {
			try {
				await shouldRetryOrPromise;
				return true;
			} catch (_err) {
				return false;
			}
		}
		return shouldRetryOrPromise;
	}

	private async handleRequestRetry(error, config) {
		const {
			      retries            = 3,
			      retryCondition     = this.isRetryableError,
			      shouldResetTimeout = false
		      } = this.getRequestOptions(config, {
			retries : this._maxRetries
		});

		const currentState = this.getCurrentState(config);

		if (await this.shouldRetry(retries, retryCondition, currentState, error)) {
			currentState.retryCount += 1;
			// Axios fails merging this configuration to the default configuration because it has an issue
			// with circular structures: https://github.com/mzabriskie/axios/issues/370
			this.fixRequestRetryConfig(axios, config);

			if (!shouldResetTimeout && config.timeout && currentState.lastRequestTime) {
				const lastRequestDuration = Date.now() - currentState.lastRequestTime;
				// Minimum 1ms timeout (passing 0 or less to XHR means no timeout)
				config.timeout            = Math.max(config.timeout - lastRequestDuration, 1);
			}

			config.transformRequest = [(data) => data];

			return new Promise((resolve) => resolve(this._instance().request(config)));
		}

		return Promise.reject(error);
	}
}

export type BrowserConsolePrevention = {
	check: boolean;
	disallowedNodeEnvs: string[];
}

export type ResponseErrorHandler = (error: AxiosError, response: null) => Promise<boolean>;

export type ResponseErrorHandlingInfo = {
	handler: (error: AxiosError, response: null) => Promise<boolean>,
	shouldThrow: boolean,
}

export type AddErrorHandler = {
	statusCode: number,
	handler: ResponseErrorHandler,
	shouldThrow: boolean
}

export type AxiosInterceptorRegistrationTypes = {
	requestSend?: { handler: (config: AxiosRequestConfig) => AxiosRequestConfig },
	successfulResponse?: { handler: (response: AxiosResponse) => AxiosResponse },
	failedResponse?: { handler: (error) => Promise<any> },
}
export type AxiosInterceptorRegistrations = {
	/**
	 * Uses:
	 * interceptors.request.use
	 */
	requestSend?: AxiosInterceptorRegistrationTypes['requestSend'][],
	/**
	 * Uses:
	 * interceptors.response.use(req => THIS ONE, undefined);
	 */
	successfulResponse?: AxiosInterceptorRegistrationTypes['successfulResponse'][],
	/**
	 * Uses:
	 * interceptors.response.use(undefined, req => THIS ONE);
	 */
	failedResponse?: AxiosInterceptorRegistrationTypes['failedResponse'][],
}
