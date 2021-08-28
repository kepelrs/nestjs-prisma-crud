---
sidebar_position: 2
---

# AccessControlModule

The `AccessControlModule` registers interceptors and the necessary business logic for [AccessPolicy](./access-policy) to work.

## Usage

```ts title=app.module.ts {5}
@Module({
    // ...
    imports: [
        // ..
        AccessControlModule.register(opts),
    ],
    // ...
})
export class AppModule {}
```

## Configuration

The `AccessControlModule.register` method receives a configuration object with the following shape:

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

**Example:** `'user'` - this would make `AccessControlModule` search for the authentication data in the `request.user` property.

<hr/>

### opts.getRolesFromAuthDataFn

**Type:** `(authData) => string[] | number[] | Set<string> | Set<number> | null | undefined` <br/>
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

If your app has non-CRUD endpoints, you can decorate them with `@AccessPolicy('everyone')` or set `strictMode` to `false` if you wish to turn it off altogether.

**Recommended:** `true`
