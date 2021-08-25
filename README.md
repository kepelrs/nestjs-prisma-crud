[![Build Status](https://www.travis-ci.com/kepelrs/nestjs-prisma-crud.svg?branch=master)](https://www.travis-ci.com/kepelrs/nestjs-prisma-crud)
[![codecov](https://codecov.io/gh/kepelrs/nestjs-prisma-crud/branch/master/graph/badge.svg?token=X2KQ8AMFA7)](https://codecov.io/gh/kepelrs/nestjs-prisma-crud)

# nestjs-prisma-crud

CRUD utility for simple REST use cases. Builds on top of [NestJS](https://github.com/nestjs/nest) and [Prisma 2](https://github.com/prisma/prisma). Inspired by [@nestjsx/crud](https://github.com/nestjsx).

> **NOTE:** This project is in early development.

## Installation

    npm i nestjs-prisma-crud

## Why

When building REST API's there is common functionality that we would prefer not to implement again and again. This package offers minimal and opinionated out of the box solutions for some of those (see [features](#features) bellow).

## ✔ Features

An overview of the provided functionality:

1. Advanced client side **joining**, **sorting**, **filtering** and **pagination** via query parameters
    - Any valid prisma `.where` can be sent by the frontend.
    - Server side validation to safeguard against arbitrarily deep `.join` or `.where` clauses by clients.
    - Support for including only specific properties in the response. _(TODO)_
2. Access control
    - `@AccessPolicy` decorator with default utilities that support functionalities similar to [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control)/[ABAC](https://en.wikipedia.org/wiki/Attribute-based_access_control).
    - Custom policy support
3. Atomic operations
    - Supports POST/PATCH with nested objects.
    - Transaction support when extending controller functionality. _(TODO)_
4. Schematics
    - `crud-resource`: a modified NestJS `resource` schematic that scaffolds the entire CRUD module for you.<br/> One-line scaffolding with: _`nest g -c nestjs-prisma-crud-schematics crud-resource <YOUR-TABLE-NAME-HERE>`_
5. Plug and play
    - Can be used alongside your other non `nestjs-prisma-crud` controllers.
    - You can use `PrismaCrudService` and `@AccessPolicy` in your custom controllers if you want to retain some of `nestjs-prisma-crud`'s functionalities.

## Quickstart

1. Setup NestJS and Prisma by following the [standard installation steps](https://www.prisma.io/nestjs). Make sure you created the `PrismaService`.
2. Install `nestjs-prisma-crud` and `nestjs-prisma-crud-schematics`:

    ```
    npm i nestjs-prisma-crud
    npm i -g nestjs-prisma-crud-schematics
    ```

3. Generate the entire crud module with a single command (replace **post** with your entity name):

    ```
    nest g -c nestjs-prisma-crud-schematics crud-resource post
    ```

4. Configure your service

    ```ts
    // post.service.ts
    import { PrismaCrudService } from 'nestjs-prisma-crud';
    import { PrismaService } from '../prisma.service';

    @Injectable()
    export class PostService extends PrismaCrudService {
        constructor(public prismaService: PrismaService) {
            super({
                prismaClient: prismaService,
                model: 'post',
                allowedJoins: ['comments.likes'],
                defaultJoins: [],
            });
        }
    }

    // post.controller.ts
    import { PostService } from './post.service';

    @Controller('post')
    export class PostController {
        constructor(private readonly postService: PostService) {}

        @Get()
        async findMany(@Query('crudQuery') crudQuery: string) {
            const matches = await this.postService.findMany(crudQuery);
            return matches;
        }
    }
    ```

## Documentation

Go [here](docs) for documentation, or see the [example](example) folder for a working NestJS application.

## License

[MIT licensed](LICENSE)

## Built with

[TSDX](https://github.com/formium/tsdx)<br>
[np](https://github.com/sindresorhus/np)<br>
[yarn 1.22.10](https://yarnpkg.com/)
