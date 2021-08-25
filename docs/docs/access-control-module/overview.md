---
sidebar_position: 1
---

# Overview

`nestjs-prisma-crud` comes with optional utilities to help you with common access control use cases. You may find it useful if:

-   You want to restrict certain endpoints to be accessible only by users with certain roles <br/> _eg. a "/report" endpoint that is only available for admin users_
-   You want to grant scoped access based on some user attributes <br/>_eg. a "/messages" endpoint that must respond only with the messages owned by the requesting user_
-   You want to write your own more complex [custom policies](./custom-policy), without breaking **pagination/sorting/filtering**.

## Quickstart

To start using the access control utilities simply register the `AccessControlModule` to your `app.module.ts`:

```ts title=app.module.ts
@Module({
    // ...
    imports: [
        // ..
        AccessControlModule.register({
            authDataKey: 'authenticatedUser',
            getRolesFromAuthDataFn: (authenticatedUser) => authenticatedUser?.roles,
            strictMode: false,
        }),
    ],
    // ...
})
export class AppModule {}
```

Then all you need to do is add the `@AccessPolicy()` decorator into your controller like so:

```ts title=post.controller.ts
@Controller('post')
export class PostController {
    // ...
    @Get()
    @AccessPolicy('everyone')
    async getPosts(@Query('crudQuery') crudQuery: string) {
        const match = await this.postsService.findMany(crudQuery);
        return match;
    }
}
```

Keep reading for more details on the [AccessControlModule](./access-control-module) and [AccessPolicy](./access-policy) configuration.
