---
sidebar_position: 6
---

# Frontend Usage & crudQuery

## Overview

:::info
All examples and schematics in this documentation demonstrate passing `crudQuery` as a `JSON.stringified` string in your query parameter.

You can chose to adjust your controllers and retrieve the `crudQuery` object from `POST` bodies or any other method you prefer. If you choose to do so, remember to also adapt any [built in](./access-control-module/builtin-policies) or [custom policies](./access-control-module/custom-policy) that were previously relying on `request.query`.

:::

Every public method of `PrismaCrudService` used in your [CRUD endpoints](./crud-endpoints) accept an optional parameter `crudQuery`.

`crudQuery` must be an object (or JSON string) with the following shape:

```ts
export type CrudQuery = {
    where?: object;
    joins?: string[];
    orderBy?: object;
    page?: number;
    pageSize?: number;
};
```

## TLDR Usage

```ts
const crudQuery = {
    where: {
        posts: {
            some: {
                comments: { some: { content: { contains: 'Hello' } } },
            },
        },
    },
    joins: ['profile', 'posts.comments'],
    orderBy: [{ age: 'asc' }],
    page: 2,
    pageSize: 100,
};

fetch('http://localhost:3000?' + new URLSearchParams({ crudQuery: JSON.stringify(crudQuery) }));
```

## CrudQuery Properties

### CrudQuery.where

**Type:** object<br/>
**Mandatory:** No<br/>
**Description:**

This must be valid prisma [`.where`](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#where) for your specific entity.

Querying nested joins is supported, as long as the joined relations are present in your service's [allowedJoins](crud-endpoints#optsallowedjoins).

**Example:**

```ts
/*
To fetch all users who have posts where someone made a comment containing the word
'Hello', send the following crudQuery query parameter to the "/users" endpoint.
*/
const crudQuery = {
    // ...
    where: {
        posts: {
            some: {
                comments: { some: { content: { contains: 'Hello' } } },
            },
        },
    },
};
```

For more information on the `.where` object, see the [prisma API reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#where).

<hr/>

### CrudQuery.joins

**Type:** string[]<br/>
**Mandatory:** No<br/>
**Description:**

The joined relations you wish the response to include. Supports dot notation.

Setting this value will override the server's [defaultJoins](crud-endpoints#optsdefaultjoins) option.

_**Note:** endpoint will throw `403` if the provided join is not present in [allowedJoins](crud-endpoints#optsallowedjoins)_

**Example:**

```ts
/*
Send the following crudQuery to the "/users" endpoint to get the user with:
  1. his profile
  2. all his posts
  3. all his posts' comments
*/
const crudQuery = {
    // ...
    joins: ['profile', 'posts.comments'],
};
```

<hr/>

### CrudQuery.orderBy

**Type:** Array&lt{[string]: 'asc' | 'desc'}&gt<br/>
**Mandatory:** No<br/>
**Description:**

This must be a valid prisma `.orderBy` array. See [prisma orderBy reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#orderby) for more.

**Example:**

```ts
const crudQuery = {
    // ...
    orderBy: [{ age: 'asc' }],
};
```

<hr/>

### CrudQuery.page

**Type:** number <br/>
**Mandatory:** No<br/>
**Description:**

The page property is used to control the pagination in the `prismaCrudService.findMany` responses.

Page value must be `1` or greater.

**Example:**

```ts
const crudQuery = {
    // ...
    page: 2,
};
```

<hr/>

### CrudQuery.pageSize

**Type:** number <br/>
**Mandatory:** No<br/>
**Description:**

The pageSize property is used to control the pagination in the `prismaCrudService.findMany` responses. It be `1` or greater and will get overriden if passed a larger value than [configured in the service](./crud-endpoints#configuration).

**Example:**

```ts
const crudQuery = {
    // ...
    pageSize: 100,
};
```

<hr/>
