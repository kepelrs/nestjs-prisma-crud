---
sidebar_position: 7
---

# Limitations & v1 Roadmap

This section describes some design decisions regarding `nestjs-prisma-crud`.

## Roadmap for v1

-   [x] Backend nested create
-   [x] Backend nested update
-   [x] Simple GET read one/many
-   [x] Delete
-   [x] Complex GET Frontend QueryBuilding
    -   [x] Allow specifying joins from frontend (as long as allowed on backend)
    -   [x] Allow clients to specify select fields (only, except). TODO: Document that these still get fetched from db.
    -   [x] Pagination
        - [ ] Configurable pagination defaults (pageSize min/max)
        - [ ] OrderBy validation
    -   [x] Allow complex where
        - [ ] throw 400 instead of 500 for invalid .where
-   [x] Access control policy strategy
    -   [x] Default utility guards
    -   [x] Rename crudQ
    -   [x] Examples
-   [x] crud schematics
-   [x] improve module configuration
-   [x] additional transaction support tests and implementation.
-   [x] test nested create cannot happen passed allowed joins
-   [x] rename AccessPolicyModule to AccessControlModule

## Current limitations & known issues

-   NO JSON column support. nestjs-prisma-crud assumes a nested object is a relation object.
    -   Suggested workaround: use middleware for transforming into string on both frontend and backend
-   Prisma keywords may not be used as model properties
    -   TODO: document which are those
-   No type safety: given the `crudQuery` dynamic nature, `PrismaCrudService` makes no effort to provide type safety on it's return values.
    -   If you really need great type safety, its recommended that you create a plain NestJS + Prisma controller.
-   No bulk operations, and no planned support at this point...

## Thank You

We hope you will enjoy `nestjs-prisma-crud`!
