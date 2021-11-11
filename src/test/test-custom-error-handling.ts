import "reflect-metadata";
import {EnvusoApi} from "../Api/ApiExtenders/EnvusoApi";

import {LaravelApi} from "../Api/ApiExtenders/LaravelApi";
import {DataTransferObjectManager} from "../Dto";
import UserModel from "./TestingObject";

DataTransferObjectManager.initiate();

const api = EnvusoApi.create({
	baseUrl    : 'http://mock-api.test',
	maxRetries : 5,
});

api.setMainErrorHandler(false, async (error) => {
	console.log('An unhandled main error: ', error);
	return true;
});

api.addErrorHandler({
	shouldThrow : false,
	statusCode  : 500,
	handler     : async (error) => {
		console.log('An unhandled error: ', error);
		return true;
	},
});

api.addErrorHandler({
	shouldThrow : false,
	statusCode  : 404,
	handler     : async (error) => {
		console.log('An unhandled 404: ', error?.response?.data);
		return true;
	},
});

const run = async () => {

	const res = await api
		.toMany(UserModel)
		.get('/user.json');

	const failingRes = await api
		.toMany(UserModel)
		.get('/users-failed.json');

	const unknownTypeCall = await api.get('/user.json');
	const unknownRetryTypeCall = await api.get('/users.json');

	debugger;

};

run();
