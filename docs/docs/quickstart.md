---
sidebar_position: 2
---

# Quickstart

:::info

This guide assumes you have already setup **NestJS** and **Prisma**. See [Getting Started](./getting-started) if you haven't.
:::
<br/>

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
