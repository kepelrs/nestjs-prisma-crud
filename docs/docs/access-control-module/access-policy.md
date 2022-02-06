---
sidebar_position: 3
---

# AccessPolicy Decorator

The `AccessPolicy` decorator is meant to be used in the routes you wish to protect.

### Usage

```ts title=post.controller.ts {2}
@Get('posts')
@AccessPolicy(allowedRoles, policyMethod1, policyMethod2, policyMethod3 ...)
async getPosts(@Query('crudQuery') crudQuery: string) {
    const match = await this.postsService.findMany(crudQuery);
    return match;
}
```

### allowedRoles

The first parameter passed to `@AccessPolicy()` specifies which roles should be granted access to the decorated route.

Acceptable values are:

1. **'everyone'**: This option makes the route public, granting access to anyone regardless if they are authenticated or not.
1. **'anyRole'**: This option makes the route accessible to anyone who is authenticated and has at least one role.
1. **An Array or Set of ids**: the specific role ids which should be granted access to the decorated route. These will be compared with roles retrieved from [authData](/nestjs-prisma-crud/access-control-module#optsauthdatakey) by passing it to [getRolesFromAuthDataFn](/nestjs-prisma-crud/access-control-module#optsgetrolesfromauthdatafn).

### policyMethods

All values after `allowedRoles` are `policyMethods`. These are used to apply any access control logic that goes beyond simple role checks. They can be [built in policies](./builtin-policies), or your own [custom policies](./custom-policy).

You can add multiple policies by simply including more arguments to `@AccessPolicy(roles, ...policies)`. See [usage](#usage).
