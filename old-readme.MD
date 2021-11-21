

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
