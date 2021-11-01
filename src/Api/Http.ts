import axios, {AxiosResponse, Method} from "axios";

export class Http {

	_token: string                      = null;
	_baseUrl: string                    = null;
	_headers: { [key: string]: string } = {
		'Content-Type' : 'application/json',
		'Accept'       : 'application/json',
	};

	public setBaseUrl(url: string) {
		this._baseUrl = url;

		return this;
	}

	public setBaseHeaders(headers: { [key: string]: string }) {
		this._headers = headers;

		return this;
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
		return axios.create({
			baseURL         : this.apiBaseUrl(),
			headers         : this._headers,
			withCredentials : true,
		});
	}

	public async many<T extends any[]>(method: Method, endpoint: string, params: object = {}): Promise<AxiosResponse<T>> {
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

	public async one<T extends any>(method: Method, endpoint: string, params: object = {}): Promise<AxiosResponse<T>> {
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

	public get<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().get<T>(endpoint, {
			params : params,
		});
	}

	public put<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().put<T>(endpoint, params);
	}

	public patch<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().patch<T>(endpoint, params);
	}

	public post<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().post<T>(endpoint, params);
	}

	public delete<T>(endpoint: string, params: object = {}): Promise<any> {
		return this._instance().delete<T>(endpoint, {
			params : params,
		});
	}

}
