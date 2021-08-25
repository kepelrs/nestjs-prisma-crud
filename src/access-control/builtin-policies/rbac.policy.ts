import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
    AccessPolicyInterceptorOpts,
    ACCESS_POLICY_OPTS_KEY,
    PolicyMethod,
} from '../access-policy.interceptor';

type AllowedRolesId = string[] | number[] | Set<string> | Set<number>;
export type GetRolesReturnType = string[] | number[] | Set<string> | Set<number> | null | undefined;
export type GetRolesFunction = (request: any) => GetRolesReturnType;

export const RBAC = <T extends AllowedRolesId = AllowedRolesId>(
    allowedRoles: AllowedRoles<T>,
    authData: any,
    moduleRef: ModuleRef,
): PolicyMethod => (_: ExecutionContext) => {
    if (allowedRoles === 'everyone') {
        return;
    }

    // not 'everyone', therefore the user must be denied if not authenticated:
    if (!authData) {
        throw new UnauthorizedException();
    }

    // if this code is reached, user is authenticated
    const accessPolicyInterceptorOpts: AccessPolicyInterceptorOpts = moduleRef.get(
        ACCESS_POLICY_OPTS_KEY,
        { strict: false },
    );
    const { getRolesFromAuthDataFn } = accessPolicyInterceptorOpts;
    const userRoles = getRolesFromAuthDataFn(authData);
    const userRolesSet: Set<any> = new Set(userRoles as any);

    if (!userRolesSet.size) {
        throw new ForbiddenException(`User's roles do not grant access to the requested resource.`);
    }

    // if this code is reached, user is authenticated and has at least one role
    if (allowedRoles === 'anyAuthenticated') {
        // 'anyAuthenticated' and at least one userRole exists, access is granted
        return;
    }

    // if this code is reached allowedRoles is an array or set of ids. Check if any roles overlap:
    const userRolesArray = Array.from(userRolesSet);
    const allowedRolesSet = new Set(allowedRoles as any);
    for (let i = 0; i < userRolesArray.length; i++) {
        const role = userRolesArray[i];
        if (allowedRolesSet.has(role)) {
            return;
        }
    }

    throw new ForbiddenException(`User's roles do not grant access to the requested resource.`);
};

export type AllowedRoles<T extends AllowedRolesId = AllowedRolesId> =
    | 'everyone'
    | 'anyAuthenticated'
    | T;
