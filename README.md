# nestjs-prisma-crud

CRUD utility for simpler REST use cases.

1. Builds on top of NestJS and Prisma 2+
1. Subset of NestJSX/Crud features (TODO: Specify)

## Installation

    npm i nestjs-prisma-crud

## Why

1. TODO: Define what this project is
2. Define what it is NOT

## Quickstart

TODO

## More examples

TODO example folder

## Roadmap

-   [x] Backend nested create
-   [x] Backend nested update
-   [x] Simple GET read one/many
-   [x] Delete
-   [x] Complex GET Frontend QueryBuilding
    -   [x] Allow specifying joins from frontend (as long as allowed on backend)
    -   [ ] Allow specifying select fields. TBD
        -   some mechanism to blacklist/whitelist specific properties in response
    -   [x] Pagination
    -   [x] Allow complex where (TODO: test further)
-   [x] Access control policy strategy
    -   [x] Default utility guards
    -   [ ] Rename crudQ
    -   [ ] Examples
-   [ ] crud schematics
-   [ ] improve module configuration
-   [ ] additional transaction support tests and examples

## Limitations & known issues

-   JSON support. nestjs-prisma-crud assumes an object is a relation when `typeof somePossiblyNestedProperty === 'object'`. Prisma does not provide public model API to retrieve information about which properties are relations. TODO: investigate_further
-   TODO

## Built with

[TSDX](https://github.com/formium/tsdx)<br>
[np](https://github.com/sindresorhus/np)<br>
[yarn 1.22.10](https://yarnpkg.com/)
