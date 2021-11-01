# Api Utilities

When working frontend/backend and working with api's, I like to map the responses to classes so that I get nice type completion. and so I can add additional
helper methods on said classes, related to what they do.

We use :

- [https://github.com/typestack/class-transformer](https://github.com/typestack/class-transformer) to deal with converting object -> class
- [https://github.com/typestack/class-validator](https://github.com/typestack/class-validator) for doing validation on the classes also.
- [https://github.com/axios/axios](https://github.com/axios/axios) for sending requests

We call the resulting class a "Data Transfer Object".

## Getting things set-up

SomeMemorableWord
```
yarn add api-utilities
npm install api-utilities
```

First we need to initiate the DataTransferObject Manager like so:

```ts
import {DataTransferObjectManager} from "api-utilities";

DataTransferObjectManager.initiate();
```

This will allow the manager to pick up any DataTransferObjects configured.

Now, lets set our base information for the api handler.

```ts
import {Api} from "api-utilities";

const api = Api.create({
	baseUrl : 'your apis base url, for ex: https://my.api.com',
	headers : {
		'Content-Type' : 'application/json',
		'Accept'       : 'application/json',
	}
})

// If you need to send JWT using the authorization header, you can configure it above or...
api.setAuthorizationToken('jwt');
// This results in the header: "Authorization: Bearer jwt" being sent with requests.
// You can customise the prefix also, ie the "Bearer" part.
api.setAuthorizationToken('jwt', "CustomToken");
// This results in the header: "Authorization: CustomToken jwt" being sent with requests.
```

## Now let's create a DataTransferObject
*UserModel.ts*
```ts
import {DataTransferObject, dto} from "api-utilities";

@dto(UserModel)
export default class UserModel extends DataTransferObject<UserModel> {
	public id: number;
	public username: string;
}
```
There's a little additional boilerplate, but it will all make sense.

Some examples of interacting with a DTO:
```ts
// Imagine this plain user object:
const plainUserObject = {username: '...', id: 0};

// We can convert it to our Model/DTO like so:
UserModel.create(plainUserObject) // returns: UserModel{username: '...', id: 0}

// If we have an array of users:
UserModel.create([plainUserObject, plainUserObject])// returns [UserModel, UserModel]

// Arrays are detected and automatically converted. All with correct typings.
```

## Now... let's make an api request:

```ts

const response = await api.asOne(UserModel).get('/api/user/me');
// This will return an `ApiResponse` instance.
// This class has some additional methods to make life a little easier
// I personally got tired of dealing with try/catches for most regular api errors
// If you're also familar with laravel, it's validation exceptions are always the same structure

//Get the resulting user model from the response:
const user = response.get(); // UserModel

// If we had validation errors:
response.validationError('key')
response.hasValidationError('key')
response.hasValidationErrors
response.validationErrors

//Checking if the api request failed/was successful
response.isSuccessful
response.isError

//Getting the underlying original response
response.data


// Making a request for multiple UserModels:

const allUsersResponse = await Api.asMany(UserModel).get('/api/users');

allUsersResponse.get(); // [UserModel, UserModel]

```

###  There's also some aliases for these methods which you can use depending on your naming preference:

#### many:
- fromMany()
- toMany()
- many()
#### one:
- fromOne()
- toOne()
- one()
#### paginated:
- paginated()
