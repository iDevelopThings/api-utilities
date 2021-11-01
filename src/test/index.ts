import "reflect-metadata";
import {EnvusoApi} from "../Api/ApiExtenders/EnvusoApi";

import {LaravelApi} from "../Api/ApiExtenders/LaravelApi";
import {DataTransferObjectManager} from "../Dto";
import UserModel from "./TestingObject";

DataTransferObjectManager.initiate();

const api = EnvusoApi.create({
	baseUrl : 'http://127.0.0.1:8081',
});

const run = async () => {

	const users = await api
		.toMany(UserModel)
		.get('/test/list');


	const user = await api
		.toOne(UserModel)
		.get('/test');

	const paginated = await api.paginated(UserModel).get('/test/paginated');
	const pres      = paginated.get();

	const failingResponse = await api
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
