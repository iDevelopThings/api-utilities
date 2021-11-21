# Api Utilities

When working frontend/backend and working with api's, I like to map the responses to classes so that I get nice type completion. and so I can add additional
helper methods on said classes, related to what they do.

We use :

- [https://github.com/typestack/class-transformer](https://github.com/typestack/class-transformer) to deal with converting object -> class
- [https://github.com/typestack/class-validator](https://github.com/typestack/class-validator) for doing validation on the classes also.
- [https://github.com/axios/axios](https://github.com/axios/axios) for sending requests


# Documentation:

[https://api-utilities.idt.dev](https://api-utilities.idt.dev)

## Preview

Please refer to the documentation above to learn about how api-utilities works.

Here's a little sample code as a teaser :D

```ts
import {Api, DataTransferObject} from "api-utilities";

const api = Api.create({
	baseUrl : 'your apis base url, for ex: https://my.api.com',
	headers : {
		'Content-Type' : 'application/json',
		'Accept'       : 'application/json',
	}
})
api.setAuthorizationToken('jwt');

// Create your DataTransferObject
export default class UserModel extends DataTransferObject<UserModel> {
	public id: number;
	public username: string;
}

// Convert your plain js object into a class:
UserModel.create({username : 'Bruce', id : 1});

// Get a "User" from your api 
const response = await api.asOne(UserModel).get('/api/user/me');
// and convert the response to a UserModel instance.
const user = response.get();
```

### We also have "Forms" to make frontend a little more fun.
```typescript

const userForm = api.form(UserModel, RequestMethod.PATCH, '/api/user/me');
userForm.username = 'Setting a new username with type safety! :D';

// Submit the request
await userForm.submit();

// Some states:
// userForm.processing
// userForm.recentlySuccessful
// userForm.hasError('username');

//.... so much more
```
