import axios, {AxiosResponse, Method} from "axios";

export class Http {

	static _token: string                      = null;
	static _baseUrl: string                    = null;
	static _headers: { [key: string]: string } = {
		'Content-Type' : 'application/json',
		'Accept'       : 'application/json',
	};

	public static setBaseUrl(url: string) {
		this._baseUrl = url;

		return this;
	}

	public static setBaseHeaders(headers: { [key: string]: string }) {
		this._headers = headers;

		return this;
	}

	public static setAuthorizationToken(token: string, prefix: string = 'Bearer') {
		if (!token) {
			this._token = null;
			delete this._headers['Authorization'];

			return this;
		}

		this._token                    = [prefix, token].join(' ');
		this._headers['Authorization'] = this._token;

		return this;
	}

	public static headers(): { [key: string]: string } {
		return this._headers;
	}

	public static apiBaseUrl(): string {
		return this._baseUrl;
	}

	private static _instance() {
		return axios.create({
			baseURL         : this.apiBaseUrl(),
			headers         : this._headers,
			withCredentials : true,
		});
	}

	public static async many<T extends any[]>(method: Method, endpoint: string, params: object = {}): Promise<AxiosResponse<T>> {
		let dataProp = 'data';

		if (['GET', 'DELETE'].includes(method.toUpperCase())) {
			dataProp = 'params';
		}

		return this._instance().request<T>({
			method,
			url        : endpoint,
			[dataProp] : params
		});
	}

	public static async one<T extends any>(method: Method, endpoint: string, params: object = {}): Promise<AxiosResponse<T>> {
		let dataProp = 'data';

		if (['GET', 'DELETE'].includes(method.toUpperCase())) {
			dataProp = 'params';
		}

		return this._instance().request<T>({
			method,
			url        : endpoint,
			[dataProp] : params
		});
	}

	public static get<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().get<T>(endpoint, {
			params : params,
		});
	}

	public static put<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().put<T>(endpoint, params);
	}

	public static patch<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().patch<T>(endpoint, params);
	}

	public static post<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().post<T>(endpoint, params);
	}

	public static delete<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().delete<T>(endpoint, {
			params : params,
		});
	}

}
