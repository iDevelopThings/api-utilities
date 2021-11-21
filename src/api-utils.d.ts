//declare module 'axios' {
//	export interface AxiosRequestConfig = AxiosRequestConfig & {
//		'retries'?: {
//			retryCount: number;
//			lastRequestTime: number;
//		};
//	}
//}

//export type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
//export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
//export type FunctionProperties<T> = Omit<T, NonFunctionPropertyNames<T>>;
//export type StringKeys<T> = Pick<T, Extract<keyof T, string>>;
//export type DtoMethods<T> = StringKeys<Partial<FunctionProperties<T>>>;
//export type DtoProperties<T> = StringKeys<Partial<NonFunctionProperties<T>>>;
////export type DtoProperties<T> = StringKeys<T>;
//export type Magic<T> = T & { [key: string]: any };
//export type DtoProperty<T> = keyof DtoProperties<T>;


//type DtoPropertyNames<T> = {
//	[K in keyof T]: T[K] extends Function ? never : K;
//}[keyof T];
//
//type DtoPropertiesOnly<T> = {
//	[P in DtoPropertyNames<T>]: T[P] extends object ? DtoProperties<T[P]> : T[P]
//};
//export type DtoProperties<T> = DtoPropertiesOnly<T>;
//export type ArrayOfDtoProperties<T> = (keyof DtoProperties<T>)[];
//export type SingleDtoProp<T> = keyof DtoProperties<T>;
