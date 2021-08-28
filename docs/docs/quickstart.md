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

2. Generate the entire crud module with the following command (replace **post** with your table's name from your Prisma schema):

    ```
    nest g -c nestjs-prisma-crud-schematics crud-resource post
    ```

3. Start the server:
    ```
    npm run start:dev
    ```

4. Verify installation by navigating to [http://localhost:3000/post](http://localhost:3000/post)
