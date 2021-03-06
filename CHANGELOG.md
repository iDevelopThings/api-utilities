# 0.1.5

- Change to "microbundle" for creating the dist, fixed a lot of issues in different environments
- Updated Form
  - transform() method added 
  - set() method added
  - Read about these on the docs: [https://api-utilities.idt.dev/docs/forms/usage/](https://api-utilities.idt.dev/docs/forms/usage/)
- Updated DataTransferObject
  - Changed name of static bool to enable validation by default... naming wasn't very obvious what it does
  - From ``useDtoValidation`` to ``validateOnCreate

# 0.1.0

Remove DataTransferObjectManager & Mapper stuff. It was from an old version of this project, wasn't used/needed.

- Set up some proper documentation, still a WIP but better than the readme: [https://api-utilities.idt.dev](https://api-utilities.idt.dev)
- Implemented a "Form Request" system to make building front ends and such a little more
  fluent [https://api-utilities.idt.dev/docs/forms/usage/](https://api-utilities.idt.dev/docs/forms/usage/)
- Refactored how the validation was handled a little, validation errors are now stored on src/Dto/Validator.ts
    - src/Api/Form/Form.ts & ApiResponse, both use this class for validation checks and such.
- Add Axios config property to all methods that pass through to Axios
- When sending a request, and in the browser, if the dto contains a "File" object(an uploaded file), we'll transition the request data to use FormData. Meaning
  file upload is also somewhat supported.
    - Still need to implement uploadProgress handler in a nice way
- Started to write some tests for the logic
- Add a hacky but okay ish way to implement custom axios interceptors
    - api.addRequestSendInterceptor(config => { return config; })
    - api.addSuccessfulResponseInterceptor(response => { return response; })
    - api.addFailedResponseInterceptor(error => { return new Error('Throw something else?') })

# 0.0.5

Added a nice way to handle errors which hooks into axios, auto retry handling on failed requests, some additional api response methods and a way to call
endpoints manually(without a DTO) but still get an ApiResponse instance returned.

### Error Handling

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

### Retries

- When specifying your api config setup, you can specify a maxRetries count. Any requests which are 'get', 'head', 'options' and return a status code >= 300
  and <= 600 will be retried x times.

### Browser console call prevention

- Added some logic which will prevent the api handler from being called on browser console, it's a hacky solution which won't work everywhere... but will help
  in some scenarios. We use this in a work project just as a little additional layer of protection, you can specify whether to enable it via "
  calledFromBrowserConsole" during configuration.

### Added some methods to ApiResponse class:

```ts
response.retryCount // Get the count of times the request was retried
response.didRetry // Did the request retry?
response.lastRequestTime // When was the last request sent?
response.statusCode // The status codee of the response
```

# 0.0.3

I realised that the way things were set up and configured wouldn't work with a multi api scenario. In another project I have, it uses multiple api's on the
frontend. The way things work wouldn't be possible in that project.

- Add support for different backend apis
    - Laravel
        - Laravel apis will be set up with "LaravelApi.create()"
    - Envuso
        - Envuso apis will be set up with "EnvusoApi.create()"
    - Anything that doesn't fit in with one of these backend apis can use "Api.create()"
- Add pagination handling for laravel and envuso apis
- Change how "Api" is set up and configured.
    - This will create a new instance of the Api handler, with different configurations. Allowing us to use separate headers, auth tokens etc

# 0.0.1-0.0.2

- Bug fixes and documentation changes
- Minor QOL usage changes
