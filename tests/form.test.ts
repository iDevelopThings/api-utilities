import {IsBoolean, IsString, MinLength} from "class-validator";
import {Api, ApiResponse, DataTransferObject, RequestMethod} from "../src";
import {EnvusoApi} from "../src/Api/ApiExtenders/EnvusoApi";
import {LaravelApi} from "../src/Api/ApiExtenders/LaravelApi";
import {Form} from "../src/Api/Form/Form";
import {EnvusoApiResponse} from "../src/Api/Response/Envuso/EnvusoApiResponse";
import {LaravelApiResponse} from "../src/Api/Response/Laravel/LaravelApiResponse";

describe('form', () => {
	class UserDto extends DataTransferObject<UserDto> {
		@IsString()
		@MinLength(2)
		username: string;

		@IsBoolean()
		anotherProperty?: boolean = false;
	}

	const apiConfig  = {baseUrl : 'http://mock-api.test'};
	const api        = Api.create(apiConfig);
	const envusoApi  = EnvusoApi.create(apiConfig);
	const laravelApi = LaravelApi.create(apiConfig);

	test('class proxy', () => {

		const form    = new Form(UserDto).instance();
		form.username = 'yeet';

		expect(form.username).toBeDefined();
		expect(form.username).toEqual('yeet');
	});

	test('initiating with existing instance of dto', () => {

		const userDto    = new UserDto();
		userDto.username = 'wat';

		const form    = api.form(userDto, RequestMethod.GET, '/user.json');
		form.username = 'yeet';


		expect(form.username).toBeDefined();
		expect(form.username).toEqual('yeet');
	});

	test('submitting', () => {
		const form    = api.form(UserDto, RequestMethod.GET, '/user.json');
		form.username = 'yeet';

		const pendingPromise = form.submit();

		expect(form.processing).toBeTruthy();
		expect(form.wasSuccessful).toBeFalsy();

		pendingPromise.then(() => {
			expect(form.processing).toBeFalsy();
			expect(form.wasSuccessful).toBeTruthy();
		});

		expect(form.username).toBeDefined();
		expect(form.username).toEqual('yeet');
	});

	test('regular api response', () => {
		const form    = envusoApi.form(UserDto, RequestMethod.GET, '/api/user');
		form.username = 'yeet';

		form.submit();

		expect(form.response).toBeInstanceOf(ApiResponse);
	});

	test('envuso api response', () => {
		const form    = envusoApi.form(UserDto, RequestMethod.GET, '/api/user');
		form.username = 'yeet';

		form.submit();

		expect(form.response).toBeInstanceOf(EnvusoApiResponse);
	});

	test('laravel api response', () => {
		const form    = laravelApi.form(UserDto, RequestMethod.GET, '/api/user');
		form.username = 'yeet';

		form.submit();

		expect(form.response).toBeInstanceOf(LaravelApiResponse);
	});

	test('running dto validation - with errors', async () => {

		const form    = laravelApi.form(UserDto, RequestMethod.POST, '/validation-errors.php');
		form.username = 'y';

		let result = form.validate();

		expect(result).toBeFalsy();
		expect(form.error('username')).toEqual('username must be longer than or equal to 2 characters');

		form.username = 'yeeet';

		result = form.validate();

		expect(result).toBeTruthy();
		expect(form.error('username')).toEqual(null);

	});

	test('dto validation + backend validation errors', async () => {

		const form    = laravelApi.form(UserDto, RequestMethod.POST, '/validation-errors.php');
		form.username = 'y';

		let result = form.validate();

		expect(result).toBeFalsy();
		expect(form.error('username')).toEqual('username must be longer than or equal to 2 characters');

		await form.submit();


		expect(form.wasSuccessful).toBeFalsy();
		expect(form.processing).toBeFalsy();
		expect(form.hasErrors()).toBeTruthy();
		expect(form.error('username')).toEqual('Invalid username');
		expect(form.hasError('username')).toBeTruthy();

	});

	test('validation errors', async () => {

		const form    = laravelApi.form(UserDto, RequestMethod.POST, '/validation-errors.php');
		form.username = 'yeet';

		await form.submit();


		expect(form.wasSuccessful).toBeFalsy();
		expect(form.processing).toBeFalsy();
		expect(form.hasErrors()).toBeTruthy();
		expect(form.error('username')).toEqual('Invalid username');
		expect(form.hasError('username')).toBeTruthy();

	});

	test('clearing validation errors', async () => {

		const form    = laravelApi.form(UserDto, RequestMethod.POST, '/validation-errors.php');
		form.username = 'yeet';

		await form.submit();


		expect(form.wasSuccessful).toBeFalsy();
		expect(form.processing).toBeFalsy();
		expect(form.hasErrors()).toBeTruthy();

		form.clearErrors();

		expect(form.hasErrors()).toBeFalsy();

	});

	test('resetting', async () => {

		const form           = laravelApi.form(UserDto, RequestMethod.POST, '/validation-errors.php');
		form.username        = 'yeet';
		form.anotherProperty = true;

		expect(form.username).toBeDefined();
		expect(form.username).toEqual('yeet');
		expect(form.anotherProperty).toBeDefined();
		expect(form.anotherProperty).toEqual(true);

		form.reset();

		expect(form.username).toBeUndefined();
		expect(form.anotherProperty).toEqual(false);

	});

	test('resetting with pre-existing dto', async () => {
		const bruce = UserDto.create({
			username : 'Bruce'
		});


		const form    = laravelApi.form(bruce, RequestMethod.POST, '/validation-errors.php');
		form.username = 'yeet';

		expect(form.username).toBeDefined();
		expect(form.username).toEqual('yeet');

		form.reset();

		expect(form.username).toBeUndefined();
		expect(form.anotherProperty).toEqual(false);

	});

});


export {};
