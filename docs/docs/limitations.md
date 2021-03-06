---
sidebar_position: 7
sidebar_label: Limitations & Roadmap
hide_title: true
---

# Limitations & Known Issues

-   No JSON column support.
    -   `nestjs-prisma-crud` assumes a nested object is a relation.
    -   Suggested workaround if you really want JSON objects: use middleware for transforming into string on both frontend and backend
    -   Planned for v1.x.x
-   Prisma keywords may not be used as model properties
    -   TODO: document or link which are those
-   No type safety: given the `crudQuery`'s dynamic nature, `PrismaCrudService` makes no effort to provide type safety on it's return values.
    -   If you really need great type safety, its recommended that you create a plain NestJS + Prisma controller.
-   No bulk operations
    -   And no planned support at this point.

## Roadmap for v1

-   [x] Backend nested create
-   [x] Backend nested update
-   [x] Simple GET read one/many
-   [x] Delete
-   [x] Complex GET Frontend QueryBuilding
    -   [x] Allow specifying joins from frontend (as long as allowed on backend)
    -   [x] Allow clients to specify select fields (only, except).
    -   [x] Pagination
        -   [x] Configurable pagination defaults (pageSize min/max)
        -   [x] OrderBy validation
    -   [x] Allow complex where
-   [x] Access control policy strategy
    -   [x] Default utility guards
    -   [x] Rename crudQ
    -   [x] Examples
-   [x] crud schematics
-   [x] improve module configuration
-   [x] additional transaction support tests and implementation.
-   [x] test nested create cannot happen passed allowed joins
-   [x] rename AccessPolicyModule to AccessControlModule
-   [ ] Test access control plays nicely with websockets

## Roadmap for v1.x.x

-   [ ] Configurable global settings
-   [ ] Some JSON support
-   [ ] Start benchmarking

## Thank You

We hope you will enjoy `nestjs-prisma-crud`!
