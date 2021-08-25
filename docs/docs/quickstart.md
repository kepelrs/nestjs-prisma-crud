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
    npm i -g nestjs-prisma-crud-schematics
    ```

2. Generate the entire crud module with a single command (replace **post** with some your table's name from your Prisma schema):

    ```
    nest g -c nestjs-prisma-crud-schematics crud-resource post
    ```

3. Visit http://localhost:3000/post