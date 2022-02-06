---
sidebar_position: 2
---

# Module Registration

Add `.accessControl` to your module registration to setup interceptors and other necessary logic for [AccessPolicy](/nestjs-prisma-crud/access-control-module/access-policy) to work.

## Usage

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

## Configuration

The `.accessControl` property is a configuration object with the following shape:

```ts
export interface AccessPolicyInterceptorOpts {
    authDataKey: string;
    getRolesFromAuthDataFn: GetRolesFunction;
    strictMode: boolean;
}
```

Below you can find the documentation for each option.

### opts.authDataKey

**Type:** `string` <br/>
**Mandatory:** Yes<br/>
**Description:**

The property of the `request` where your authentication middleware stores the information about the user (we call that `authData`) after verifying authentication (token/cookies/session).

Common implementations typically use `'user'` for this value (eg. [Passport](https://docs.nestjs.com/security/authentication))

**Example:** `'authenticatedUser'` <br/>
This would make `AccessControlModule` search for the authentication data in the `request.authenticatedUser` property.

<hr/>

### opts.getRolesFromAuthDataFn

**Type:** `(authData) => string[] | number[] | Set<string> | Set<number>` <br/>
**Mandatory:** Yes<br/>
**Description:**

Method which takes the `request[opts.authDataKey]` and returns a `Set` or `Array` containing the user roles ids.

These ids will later be compared with the ones passed to `@AccessPolicy`.

**Example:** `(user) => user?.roles.map(role => role.id)`

<hr/>

### opts.strictMode

**Type:** `boolean` <br/>
**Mandatory:** Yes<br/>
**Description:**

Strict mode helps you prevent accidentally forgetting to implement access control on sensitive routes. If set to `true`, routes that were not decorated with `@AccessPolicy` will throw `501 Not Implemented` errors.

If your app has non-CRUD endpoints, you can decorate them with `@AccessPolicy('everyone')`. Alternatively, set `strictMode` to `false` if you wish to turn it off altogether.

**Recommended:** `true`
