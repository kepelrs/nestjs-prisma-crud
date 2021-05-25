import { ExecutionContext } from '@nestjs/common';
import { AccessPolicyInterceptorOpts } from '..';

type AllowedRolesId = string[] | number[] | Set<string> | Set<number>;
export type GetRolesReturnType = string[] | number[] | Set<string> | Set<number> | null | undefined;
export type GetRolesFunction = (request: any) => GetRolesReturnType;

export const RBAC = <T extends AllowedRolesId = AllowedRolesId>(
    allowedRoles: RbacParams<T>,
    authData: any,
    accessPolicyInterceptorOpts: AccessPolicyInterceptorOpts,
) => (_: ExecutionContext) => {
    if (allowedRoles === 'everyone') {
        return;
    }

    const {
        getRolesFromAuthDataFn,
        unauthorizedExceptionClass,
        forbiddenExceptionClass,
    } = accessPolicyInterceptorOpts;

    const userRoles = getRolesFromAuthDataFn(authData);
    const userRolesSet: Set<any> = new Set(userRoles || ([] as any[]));

    if (!userRolesSet || !userRolesSet.size) {
        throw new unauthorizedExceptionClass();
    } else if (allowedRoles === 'anyAuthenticated') {
        // 'anyAuthenticated' and at least one userRole exists. access is granted
        return;
    }

    // if this is reached type of allowedRoles: RbacParams is AllowedRolesId
    const userRolesArray = [...userRolesSet];
    const allowedRolesSet = new Set(allowedRoles as any[]);
    for (let i = 0; i < userRolesArray.length; i++) {
        const role = userRolesArray[i];
        if (allowedRolesSet.has(role)) {
            return;
        }
    }

    throw new forbiddenExceptionClass(
        `User's roles do not grant access to the requested resource.`,
    );
};

export type RbacParams<T extends AllowedRolesId = AllowedRolesId> =
    | 'everyone'
    | 'anyAuthenticated'
    | T;
