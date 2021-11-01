# 0.0.3

I realised that the way things were set up and configured wouldn't work with a multi api scenario.
In another project I have, it uses multiple api's on the frontend. The way things work wouldn't be possible in that project.

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
