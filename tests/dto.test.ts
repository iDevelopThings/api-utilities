import {Api, ApiResponse, DataTransferObject, RequestMethod} from "../src";


describe('dto', () => {
	class TestUserDto extends DataTransferObject<TestUserDto> {
		username: string;
		anotherProperty?: boolean = false;
	}

	const apiConfig  = {baseUrl : 'http://mock-api.test'};
	const api        = Api.create(apiConfig);

	test('getting property keys', async () => {
		const dto = new TestUserDto();

		expect(dto.getProperties()).toEqual(['username', 'anotherProperty']);
	});

	test('getting default values', async () => {
		const dto = new TestUserDto();
		dto.username = 'sdkjsk';
		dto.anotherProperty = true;

		expect(dto.getDefaultValues()['username']).toEqual(undefined);
		expect(dto.getDefaultValues()['anotherProperty']).toEqual(false);
	});

});


export {};
