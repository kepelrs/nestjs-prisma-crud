---
sidebar_position: 4
---

# Built-in Policies

`nestjs-prisma-crud` comes with built in policies that can serve a large portion of common use cases. Bellow you can learn more about them.

For more complex scenarios you can also [create your own custom policies](./custom-policy).

## MustMatchAuthAttribute Policy

### Description

Scopes the controller access to database records where `entityAttributePath` matches some dynamic property of [`authData`](access-control-module#optsauthdatakey), defined by `authDataAttributePath`.

### Function signature

```ts
MustMatchAuthAttribute(entityAttributePath: string, authDataAttributePath: string) =>
    PolicyMethod
```

:::info
`entityAttributePath` can traverse relations via dot notation, as long as the joins are present in [allowedJoins](../crud-endpoints#optsallowedjoins).

`authDataAttributePath` also supports dot notation for traversing nested properties of the `authData` object.
:::

### Example usage

:::danger Important!
Passing `crudQuery` into your function call is mandatory for `MustMatchAuthAttribute` to work. See bellow.
:::

```ts title=post.controller.ts {5,7}
@Controller('post')
export class PostController {
    // ...
    @Get()
    @AccessPolicy([RoleID.PREMIUM_USER], MustMatchAuthAttribute('author.id', 'id'))
    async getPosts(@Query('crudQuery') crudQuery: string) {
        const match = await this.postsService.findMany(crudQuery);
        return match;
    }
}
```

## MustMatchValue Policy

### Description

`MustMatchValue` works just like the above `MustMatchAuthAttribute`, but it uses a static value instead of dynamic properties of `authData`.

### Function signature

```ts
MustMatchValue(entityAttributePath: string, targetValue: any) => PolicyMethod
```

:::info
`entityAttributePath` can traverse relations via dot notation, as long as the joins are present in [allowedJoins](../crud-endpoints#optsallowedjoins).
:::

### Example usage

:::danger Important!
Passing `crudQuery` into your function call is mandatory for `MustMatchValue` to work. See bellow.
:::

```ts title=post.controller.ts {5,7}
@Controller('post')
export class PostController {
    // ...
    @Get()
    @AccessPolicy('everyone', MustMatchValue('visibility', 'PUBLIC'))
    async getPosts(@Query('crudQuery') crudQuery: string) {
        const match = await this.postsService.findMany(crudQuery);
        return match;
    }
}
```
