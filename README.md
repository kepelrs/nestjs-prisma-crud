[![Build Status](https://www.travis-ci.com/kepelrs/nestjs-prisma-crud.svg?branch=master)](https://www.travis-ci.com/kepelrs/nestjs-prisma-crud)
[![codecov](https://codecov.io/gh/kepelrs/nestjs-prisma-crud/branch/master/graph/badge.svg?token=X2KQ8AMFA7)](https://codecov.io/gh/kepelrs/nestjs-prisma-crud)

# nestjs-prisma-crud

CRUD utility for simple REST use cases. Builds on top of [NestJS](https://github.com/nestjs/nest) and [Prisma 2](https://github.com/prisma/prisma). Inspired by [@nestjsx/crud](https://github.com/nestjsx).

> **NOTE:** This project is in early development.

## Installation

    npm i nestjs-prisma-crud

## Why

When building REST API's there are recurrent themes that we would prefer not to implement again and again. This package offers opinionated out of the box solutions for some of those (see bellow).

### Features

1. Pagination.
2. Advanced querying (filtering) by frontend.
    - Any valid prisma `.where` can be sent by the frontend.
    - Backend offers validation to safeguard against arbitrarily deep `.where` clauses by clients.
    - Support for including only specific properties in the response. _(TODO)_
3. Access control.
    - `@AccessPolicy` decorator with default utilities that provide [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control)/[ABAC](https://en.wikipedia.org/wiki/Attribute-based_access_control) like functionalities.
4. Easy joins.
    - Load nested relations with a single http request.
    - Define `allowedJoins`/`defaultJoins` in your backend.
5. Atomic operations
    - Supports POST/PATCH with nested objects.
    - Transaction support when extending controller functionality. _(TODO)_
6. Schematics
    - Modified `resource` schematic that scaffolds the entire CRUD module.
    - TODO: Add example.

For more complex scenarios you can write your own completely custom [NestJS](https://github.com/nestjs/nest)/[Prisma](https://github.com/prisma/prisma) controllers, or you can leverage the `PrismaCrudService` to retain some of the above features.

## Quickstart

TODO

## More examples

TODO example folder

1. Creating Custom policies
2. ...

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
-   [ ] test nested create cannot happen passed allowed joins

## Current limitations & known issues

-   id fields are not yet configurable
    -   models must have PK called id and must be of type string
-   NO JSON support. nestjs-prisma-crud assumes an object is a relation when `typeof somePossiblyNestedProperty === 'object'`. TODO: investigate_further
    -   Current workaround: use middleware for transforming into string on both frontend and backend
-   Prisma keywords may not be used as model properties
    -   TODO: document which are those words or automate validation

## Built with

[TSDX](https://github.com/formium/tsdx)<br>
[np](https://github.com/sindresorhus/np)<br>
[yarn 1.22.10](https://yarnpkg.com/)
