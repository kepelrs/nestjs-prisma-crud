---
sidebar_position: 1
sidebar_label: Quickstart
---

# Overview

`nestjs-prisma-crud` comes with optional utilities to help you with common access control use cases. You may find it useful if:

-   You want to restrict certain endpoints to be accessible only by users with certain roles <br/> _eg. a "/report" endpoint that is only available for admin users_
-   You want to grant scoped access based on some user attributes <br/>_eg. a "/messages" endpoint that must respond only with the messages owned by the requesting user_
-   You want to write your own more complex [custom policies](./custom-policy), without breaking or re-implementing pagination/sorting/filtering.

## Quickstart

To start using the access control utilities you must first register the `.accessControl` settings in your `PrismaCrudModule` registration:

```ts title=app.module.ts {7-11}
import { PrismaCrudModule } from 'nestjs-prisma-crud';

@Module({
    imports: [
        PrismaCrudModule.register({
            prismaService: PrismaService,
            accessControl: {
                authDataKey: 'user',
                getRolesFromAuthDataFn: (authenticatedUser) => authenticatedUser?.roles,
                strictMode: false,
            },
        }),
    ],
    // ...
})
export class AppModule {}
```

Then add the `@AccessPolicy()` decorator to your controllers like so:

```ts title=post.controller.ts {5}
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

See the next sessions for more details on the [AccessControlModule](./access-control-module) and [AccessPolicy](./access-policy) configuration.
