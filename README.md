<div>
<a href="https://github.com/kepelrs/nestjs-prisma-crud/actions/workflows/tests.yml">
<img src="https://github.com/kepelrs/nestjs-prisma-crud/actions/workflows/tests.yml/badge.svg" alt="build" />
</a>

<a href="https://codeclimate.com/github/kepelrs/nestjs-prisma-crud/maintainability">
<img src="https://api.codeclimate.com/v1/badges/d5807bc933d427ef4c61/maintainability" />
</a>

<a href="https://codecov.io/gh/kepelrs/nestjs-prisma-crud">
<img src="https://codecov.io/gh/kepelrs/nestjs-prisma-crud/branch/master/graph/badge.svg?token=X2KQ8AMFA7" alt="codecov" />
</a>

<a href="https://www.npmjs.com/package/nestjs-prisma-crud">
<img src="https://img.shields.io/npm/dm/nestjs-prisma-crud.svg" alt="npm downloads" />
</a>

<a href="https://github.com/kepelrs/nestjs-prisma-crud/blob/master/package.json">
    <img src="https://img.shields.io/badge/dependencies-2-brightgreen" alt="Dependencies" />
</a>

<a href="https://github.com/kepelrs/nestjs-prisma-crud/blob/master/LICENSE">
  <img src="https://img.shields.io/github/license/kepelrs/nestjs-prisma-crud.svg" alt="License" />
</a>
</div>

# nestjs-prisma-crud

CRUD utility for simple REST use cases. Builds on top of [NestJS](https://github.com/nestjs/nest) and [Prisma](https://github.com/prisma/prisma). Inspired by [@nestjsx/crud](https://github.com/nestjsx).

## Installation

    npm i nestjs-prisma-crud --save
    npm i nestjs-prisma-crud-schematics --save-dev

## Why

When building REST API's there is common functionality that we would prefer not to implement again and again. This package offers minimal and opinionated out of the box solutions for some of those (see [features](#features) below).

## ✔ Features

An overview of the provided functionality:

1. Advanced client side **joining**, **sorting**, **filtering** and **pagination** via query parameters
    - Any valid prisma `.where` can be sent by the frontend.
    - Server side validation to safeguard against arbitrarily deep `.join` or `.where` clauses by clients.
    - Support for including only specific properties in the response.
2. Access control
    - `@AccessPolicy` decorator with default utilities that support functionalities similar to [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control)/[ABAC](https://en.wikipedia.org/wiki/Attribute-based_access_control).
    - Custom policy support.
3. Atomic operations
    - Supports POST/PATCH with nested objects.
    - Transaction support when extending controller functionality.
4. Schematics
    - `crud-resource`: a modified NestJS `resource` schematic that scaffolds the entire CRUD module for you.<br/> One-line scaffolding with: _`nest g -c nestjs-prisma-crud-schematics crud-resource <YOUR-TABLE-NAME-HERE>`_
5. Plug and play
    - Can be used alongside your other non `nestjs-prisma-crud` controllers.
    - You can still use `PrismaCrudService` and `@AccessPolicy` in your custom controllers if you want to retain some of `nestjs-prisma-crud`'s functionalities.

## Quickstart

> Assumes both NestJS and Prisma2 are already setup. See [Getting Started](https://kepelrs.github.io/nestjs-prisma-crud/getting-started).

1. Install `nestjs-prisma-crud` and `nestjs-prisma-crud-schematics`:

    ```
    npm i nestjs-prisma-crud
    npm i nestjs-prisma-crud-schematics --save-dev
    ```

2. Generate the entire crud module with a single command (replace **post** with your model's name):

    ```
    nest g -c nestjs-prisma-crud-schematics crud-resource post
    ```

3. Setup your service and controller

    ```ts
    // post.service.ts
    import { Injectable } from '@nestjs/common';
    import { PrismaCrudService } from 'nestjs-prisma-crud';

    @Injectable()
    export class PostService extends PrismaCrudService {
        constructor() {
            super({
                model: 'post',
                allowedJoins: ['comments.author'],
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

Go [here](https://kepelrs.github.io/nestjs-prisma-crud/) for full documentation.

## License

[MIT licensed](LICENSE)

## Built with

[TSDX](https://github.com/formium/tsdx)<br>
[np](https://github.com/sindresorhus/np)<br>
[yarn 1.22.10](https://yarnpkg.com/)
