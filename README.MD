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
const plainUserObject = {username : '...', id : 0};

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

### Automatic failed request retries

```typescript
const api = Api.create({
	baseUrl    : '...',
	maxRetries : 5, // Specify maxRetries count
});
```

### Error handlers

#### Status code specific:

Imagine if your response status code is a 401, and you want to send the user to /login for example

```typescript
const api = new Api({baseUrl : '...', maxRetries : 5})
	.addErrorHandler({
		shouldThrow : false,
		statusCode  : 401,
		handler     : async (error) => {
			console.log('User is not authenticated')
			window.location = '/login';

			return true;
		}
	});
```

#### Global

Maybe you need to handle all response errors in a specific way... this will only run for a specific response code if there is not a custom handler specified for
it.

```typescript
const api = new Api({baseUrl : '...', maxRetries : 5})
	.setMainErrorHandler(false, async (error) => {
		console.log('A error was thrown: ', error)
		return true;
	});
```

### There's also some aliases for these methods which you can use depending on your naming preference:

#### many:

- api.fromMany()
- api.toMany()
- api.many()

#### one:

- api.fromOne()
- api.toOne()
- api.one()

#### paginated:

- paginated()

#### We can also directly make requests without dtos:

- api.get('/endpoint', {message : 'hi'});
- api.delete('/endpoint', {message : 'hi'});
- api.head('/endpoint', {message : 'hi'});
- api.options('/endpoint', {message : 'hi'});
- api.post('/endpoint', {message : 'hi'});
- api.put('/endpoint', {message : 'hi'});
- api.patch('/endpoint', {message : 'hi'});
  
However... be aware, since no DTO's are used, no type completion will be available
