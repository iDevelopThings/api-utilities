import type {DataTransferObject} from "../Dto";
import {Http} from "./Http";
import {ManyResolver} from "./Resolver/ManyResolver";
import {OneResolver} from "./Resolver/OneResolver";

export class ApiHandler<T extends DataTransferObject<any>> {

	constructor(private dto: new () => T) {}

	asMany<M extends DataTransferObject<any>>(dto: new () => M): ManyResolver<M> {
		return this.toMany(dto);
	}
	many<M extends DataTransferObject<any>>(dto: new () => M): ManyResolver<M> {
		return this.toMany(dto);
	}

	toMany<M extends DataTransferObject<any>>(dto: new () => M): ManyResolver<M> {
		return new ManyResolver<M>(new ApiHandler<M>(dto), dto);
	}

	asOne<M extends DataTransferObject<any>>(dto: new () => M): OneResolver<M> {
		return this.toOne(dto);
	}
	one<M extends DataTransferObject<any>>(dto: new () => M): OneResolver<M> {
		return this.toOne(dto);
	}

	toOne<M extends DataTransferObject<any>>(dto: new () => M): OneResolver<M> {
		return new OneResolver<M>(new ApiHandler<M>(dto), dto);
	}

	configure(config: ConfigurationOptions) {
		if (config?.baseUrl) {
			Http.setBaseUrl(config.baseUrl);
		}
		if (config?.headers) {
			Http.setBaseHeaders(config.headers);
		}
	}

	setAuthorizationToken(token: string, prefix: string = 'Bearer') {
		Http.setAuthorizationToken(token, prefix);
	}
}

export const Api: ApiHandler<any> = new ApiHandler<any>(null);

export type ConfigurationOptions = {
	baseUrl: string;
	headers?: { [key: string]: string }
}
