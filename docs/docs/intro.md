---
sidebar_position: 1
slug: /
---

# Intro

`nestjs-prisma-crud` is a minimal CRUD tool for [NestJS](https://nestjs.com/) projects that use [Prisma](https://www.prisma.io/) for their database operations. It is inspired by the great work at [@nestjsx/crud](https://github.com/nestjsx/crud).

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
    - You can use `PrismaCrudService` and `@AccessPolicy` in your custom controllers if you want to retain some of `nestjs-prisma-crud`'s functionalities.
