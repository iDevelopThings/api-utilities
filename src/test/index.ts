import {Api} from "../Api/Api";
import {DataTransferObjectManager} from "../Dto";
import UserModel from "./TestingObject";

DataTransferObjectManager.initiate();


const run = async () => {

	Api.configure({
		baseUrl : 'http://127.0.0.1:8081',
	});

	const users = await Api
		.toMany(UserModel)
		.get('/test/list');


	const user = await Api
		.toOne(UserModel)
		.get('/test');

	const failingResponse = await Api
		.toOne(UserModel)
		.post('/test/error');

	if (failingResponse.hasValidationErrors) {
		const usernameErr = failingResponse.validationError('username');
	}

	const hasErr = user.hasValidationError('username');

	const userModels = users.get();
	const userModel  = user.get();

	debugger
};

run();
