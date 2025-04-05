import { ExecutionContext } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CrudQueryObj } from '../crud/types';

export type AllowedRoles<T extends AllowedRolesId = AllowedRolesId> = 'everyone' | 'anyRole' | T;

export type PolicyMethod<A = any> = (
    crudQueryObj: CrudQueryObj,
    authData: A,
    ctx: ExecutionContext,
    moduleRef: ModuleRef,
) => CrudQueryObj | Promise<CrudQueryObj>;

export type AccessPolicyConfig = [AllowedRoles, ...PolicyMethod[]];

export interface AccessPolicyInterceptorOpts {
    authDataKey: string;
    getRolesFromAuthDataFn: GetRolesFunction;
    strictMode: boolean;
}

export type AllowedRolesId = string[] | number[] | Set<string> | Set<number>;

export type GetRolesReturnType = AllowedRolesId;

export type GetRolesFunction = (request: any) => GetRolesReturnType;
