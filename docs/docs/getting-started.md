---
sidebar_position: 3
---

# Getting Started

:::info

This guide includes setup of **NestJS** and **Prisma**. See [Quickstart](./quickstart) if you already have those.
:::

## 1. Setup NestJS

Install NestJS and navigate to project folder:

```
npm i -g @nestjs/cli
nest new my-project
cd my-project
```

## 2. Setup Prisma

1. Install prisma:

    ```
    npm install prisma --save-dev
    npx prisma init
    ```

2. Add the following example into your `schema.prisma` file:

    ```js title=schema.prisma
    datasource db {
        provider = "sqlite"
        url      = "file:./dev.db"
    }

    generator client {
        provider = "prisma-client-js"
    }

    model Post {
        id      String @id
        content String
    }
    ```

3. Push your changes to the database:

    ```
    npx prisma generate
    npx prisma migrate dev
    ```

4. Create the prisma service:

    ```ts title=my-project/src/prisma.service.ts
    import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
    import { PrismaClient } from '@prisma/client';

    @Injectable()
    export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
        async onModuleInit() {
            await this.$connect();
        }
        async onModuleDestroy() {
            await this.$disconnect();
        }
    }
    ```

## 3. Setup `nestjs-prisma-crud`

1. Install `nestjs-prisma-crud` and `nestjs-prisma-crud-schematics`:

    ```
    npm i nestjs-prisma-crud --save
    npm i nestjs-prisma-crud-schematics --save-dev
    ```

2. Register the module:

    ```ts title=app.module.ts
    import { PrismaCrudModule } from 'nestjs-prisma-crud';

    @Module({
        imports: [
            /**
             *  PrismaCrudModule registers the PrismaService provider globally.
             *  No need to provide it anywhere else!
             */
            PrismaCrudModule.register({
                prismaService: PrismaService,
            }),
        ],
        // ...
    })
    export class AppModule {}
    ```

3. Generate the entire crud module with the following command (replace **post** with your table's name from your Prisma schema):

    ```
    nest g -c nestjs-prisma-crud-schematics crud-resource post
    ```

4. Start the server and verify installation:
    ```
    npm run start:dev
    curl http://localhost:3000/post # 200 response json object
    ```

## Whats next?

-   Learn more about the [crud endpoints](./crud-endpoints).
-   Browse the [access control](./access-control-module/overview) documentation.
