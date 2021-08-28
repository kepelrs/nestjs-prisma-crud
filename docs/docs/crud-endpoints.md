---
sidebar_position: 4
---

# CRUD Endpoints

<!-- :::tip TLDR;
* Use schematics to scaffold your CRUD module.
* Configure the CRUD behavior in the `post.service.ts` file.
::: -->

## Schematics

We recommend using the schematics package to quickly scaffold your CRUD modules:

1. Install `nestjs-prisma-crud-schematics` globally:

    ```
    npm i -g nestjs-prisma-crud-schematics
    ```

2. Scaffold the entire module and CRUD endpoints (replace **post** with your entity name):

    ```
    nest g -c nestjs-prisma-crud-schematics crud-resource post
    ```

The above will scaffold the entire CRUD module for you, most notably:

-   `post.controller.ts` where you can add, remove or extend your controllers' functionality.
-   `post.service.ts` where you can configure your crud endpoints.

## CRUD Controller

The CRUD controller is just a regular NestJS controller with a few characteristics:

-   All routes use the generated `YourEntityService` for performing the CRUD operations.
-   All routes retrieve `@Query('crudQuery') crudQuery: string` and pass it along to the service.

:::tip
The [schematic](#schematics) generates this file for you.
:::

```ts title=post.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    async create(@Body() createPostDto: CreatePostDto, @Query('crudQuery') crudQuery: string) {
        const created = await this.postService.create(createPostDto, { crudQuery });
        return created;
    }

    @Get()
    async findMany(@Query('crudQuery') crudQuery: string) {
        const matches = await this.postService.findMany({ crudQuery });
        return matches;
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Query('crudQuery') crudQuery: string) {
        const match = await this.postService.findOne(id, { crudQuery });
        return match;
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updatePostDto: UpdatePostDto,
        @Query('crudQuery') crudQuery: string,
    ) {
        const updated = await this.postService.update(id, updatePostDto, { crudQuery });
        return updated;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Query('crudQuery') crudQuery: string) {
        return this.postService.remove(id, { crudQuery });
    }
}
```

## CRUD Service

:::tip
The [schematic](#schematics) generates this file for you.
:::

```ts title=post.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PostService extends PrismaCrudService {
    constructor(public prismaService: PrismaService) {
        super({
            model: 'post',
            prismaClient: prismaService,
            allowedJoins: [],
        });
    }
}
```

The configuration of your crud endpoints is defined in the `super()` call:

```ts
export interface CrudServiceOpts {
    model: string;
    prismaClient: PrismaClient;
    allowedJoins: string[];
    defaultJoins?: string[];
    forbiddenPaths?: Array<string | RegExp>;
    idPropertyName?: string;
    paginationConfig?: PaginationConfig;
}
```

Below you can find a description of each option.

### opts.model

**Type:** `string` <br/>
**Mandatory:** Yes<br/>
**Description:**

The `prismaClient.model` on which you wish to perform the CRUD operations.

**Example:** `'post'`

<hr/>

### opts.prismaClient

**Type:** `PrismaClient | PrismaService` <br/>
**Mandatory:** Yes<br/>
**Description:**

The `PrismaClient` instance. You can also user your `PrismaService` if it extends the `PrismaClient`.

**Example:** `prismaService`

<hr/>

### opts.allowedJoins

**Type:** `Array<string>` <br/>
**Mandatory:** No<br/>
**Description:**

The relations which clients can ask to include in responses (see [client side usage](./client-side)). <br/>
Supports dot notation.

**Example:** `['comments.author.posts']`<br/>
**Default:** `[]`

<hr/>

### opts.defaultJoins

**Type:** `Array<string>` <br/>
**Mandatory:** No<br/>
**Description:**

The default relations to be included in responses. <br/>
_Note:_ Paths must be shallower or same depth as provided in `allowedJoins`

**Example:** `['comments.author']` or `[]`;<br/>
**Default:** `opts.allowedJoins`

<hr/>

### opts.forbiddenPaths

**Type:** `Array<string | RegExp>` <br/>
**Mandatory:** No<br/>
**Description:**

The paths you wish to omit in the returned objects. <br/>
**Important:** These values still get fetched from the database, and are excluded just before the function returns!!

**Example:**

```ts
[
    'some.nested.exact.string.path',

    // RegExp: delete anything containing the word password
    /.*password.*/,

    // RegExp: \d+ targets all comments in an array, deleting their .somethingSecret
    /comments\.\d+\.somethingSecret/,
];
```

**Default:** `[]`

<hr/>

### opts.idPropertyName

**Type:** `string` <br/>
**Mandatory:** No<br/>
**Description:**

The name of the model's primary key.

**Example:** `uuid`<br/>
**Default:** `id`

<hr/>

### opts.paginationConfig

**Type:** `PaginationConfig`

```ts
export type PaginationConfig = {
    defaultPageSize?: number;
    maxPageSize?: number;
    defaultOrderBy?: { [key: string]: 'asc' | 'desc' }[];
};
```

<br/>

**Mandatory:** No<br/>
**Description:**

**`defaultPageSize`**: when clients do not specify a [pageSize](./client-side#crudquerypagesize), this option will be used.<br/>
**`maxPageSize`**: client's [pageSize](./client-side#crudquerypagesize) option will be capped at this value.<br/>
**`defaultOrderBy`**: when clients do not specify a [sorting field](./client-side#crudqueryorderby), this option will be used by default. <br/>

**Default:**

```ts
const PAGINATION_DEFAULTS: PaginationConfig = {
    defaultPageSize: 25,
    maxPageSize: 100,
    defaultOrderBy: [{ [this.idPropertyName]: 'asc' }],
};
```

<hr/>

## Extending Controller Functionality with Transaction Support

:::info
Transaction support relies on prisma's [**Interactive Transactions**](https://www.prisma.io/docs/concepts/components/prisma-client/transactions#interactive-transactions-in-preview)
which are currently a preview feature.

In order to use this example, you must add the following to your prisma schema:

```js title=schema.prisma {3}
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["interactiveTransactions"]
}
```

:::

There are times when we want to extend a CRUD controller's functionality and perform additional database operations. In those cases we usually want all database operations to happen [atomically](<https://en.wikipedia.org/wiki/Atomicity_(database_systems)>) (_ie. if one database operation fails, cancel all other operations and leave the database unchanged_).

### Example

Suppose you have a `SalesController` where, aside from the CRUD `sale` operations, you also wish to increment and decrement the balance of the users involved.

The example below achieves atomicity by following the following steps:

1. Start a [prisma interactive transaction](https://www.prisma.io/docs/concepts/components/prisma-client/transactions#interactive-transactions-in-preview).
2. Pass `prismaTransaction` into the `PrismaCrudService` methods.
3. Use the `prismaTransaction` instead of `prismaClient` for performing your database operations.

```ts title=sales.controller.ts
interface CreateSaleDTO {
    itemId: string;
    sellerId: string;
    buyerId: string;
    dollarAmt: number;
}

@Controller('sales')
export class SalesController {
    constructor(
        private readonly salesService: SalesService,
        private readonly prismaService: PrismaService,
    ) {}

    @Post()
    async createSale(@Body() createSaleDto: CreateSaleDTO, @Query('crudQuery') crudQuery: string) {
        let createdSale;
        // 0. Start the interactive transaction
        await this.prismaService.$transaction(async (prismaTransaction) => {
            // 1. create the sale record
            createdSale = await this.salesService.create(createSaleDto, {
                crudQuery,
                prismaTransaction, //  pass prisma transaction into PrismaCrudService
            });

            // 2. increment seller's ballance
            // NOTE: using `prismaTransaction` instead of `this.prismaService`
            await prismaTransaction.user.update({
                data: {
                    balance: {
                        increment: createSaleDto.dollarAmt,
                    },
                },
                where: {
                    id: createSaleDto.sellerId,
                },
            });

            // 3. decrement buyer's ballance
            // NOTE: using `prismaTransaction` instead of `this.prismaService`
            await prismaTransaction.user.update({
                data: {
                    balance: {
                        decrement: createSaleDto.dollarAmt,
                    },
                },
                where: {
                    id: createSaleDto.buyerId,
                },
            });
        });

        return createdSale;
    }
}
```
