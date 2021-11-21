import {Api, ApiResponse, DataTransferObject, RequestMethod} from "../src";
import {EnvusoApi} from "../src/Api/ApiExtenders/EnvusoApi";
import {LaravelApi} from "../src/Api/ApiExtenders/LaravelApi";
import {Form} from "../src/Api/Form/Form";
import {EnvusoApiResponse} from "../src/Api/Response/Envuso/EnvusoApiResponse";
import {LaravelApiResponse} from "../src/Api/Response/Laravel/LaravelApiResponse";

describe('api', () => {
	class TestUserDto extends DataTransferObject<TestUserDto> {
		username: string;
		anotherProperty?: boolean = false;
		file: File                = null;
	}

	const apiConfig = {baseUrl : 'http://mock-api.test'};
	const api       = Api.create(apiConfig);

	//	test('sending file', async () => {
	//		const dto = new TestUserDto();
	//		dto.file  = new File([''], 'test-file.png');
	//
	//		const res = await api.one(TestUserDto).post('/test-file-upload.php', dto);
	//		debugger;
	//	});


	test('custom axios interceptor', async () => {
		api.addSuccessfulResponseInterceptor(response => {
			expect(response.status).toEqual(200);
			expect((response.data as any).id).toEqual(1);
			(response.data as any).id = 2;

			return response;
		});

		const res = await api.get('/user.json');

		expect(res.data.id).toEqual(2);

	});

});


export {};
