import { ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

export type AllowedRoles<T extends AllowedRolesId = AllowedRolesId> = 'everyone' | 'anyRole' | T;

export type PolicyMethod = (
    ctx: ExecutionContext,
    authData: any,
    moduleRef: ModuleRef,
) => void | any;

export type AccessPolicyConfig = [AllowedRoles, ...PolicyMethod[]];

export interface AccessPolicyInterceptorOpts {
    authDataKey: string;
    getRolesFromAuthDataFn: GetRolesFunction;
    strictMode: boolean;
}

export type AllowedRolesId = string[] | number[] | Set<string> | Set<number>;

export type GetRolesReturnType = string[] | number[] | Set<string> | Set<number> | null | undefined;

export type GetRolesFunction = (request: any) => GetRolesReturnType;
