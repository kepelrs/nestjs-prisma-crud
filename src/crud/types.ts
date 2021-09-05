import { PrismaClient } from '@prisma/client';
import { GetRolesFunction } from '../access-control/types';

export type PaginationConfig = {
    defaultPageSize?: number;
    maxPageSize?: number;
    defaultOrderBy?: { [key: string]: 'asc' | 'desc' }[];
};

export type CrudQueryObj = {
    where?: CrudWhere;
    joins?: string[];
    select?: { only?: string[]; except?: string[] };
    orderBy?: any[];
    page?: number;
    pageSize?: number;
};

export type CrudQueryFull = Required<CrudQueryObj>;

export type CrudQuery = CrudQueryObj | string | null | undefined;

export type FindOneQuery = {
    where: CrudWhere;
    include?: any;
};

export type FindManyQuery = FindOneQuery & {
    orderBy: any[];
    skip: number;
    take: number;
};

export type PaginationData = {
    skip: number;
    take: number;
    orderBy: any[];
    page: number;
    pageSize: number;
};

export type CrudWhere = any;

export type CrudMethodOpts = {
    /**
     * crudQuery: CrudQuery or its `JSON.stringified` form.
     *
     * Opinionated: although it accepts falsy values, it is not an optional property (ie. must be explicitly set to undefined).
     *
     * This helps with codebase intuition about `nestjs-prisma-crud`'s inner workings, as well as prevents serious accidental mistakes related to access control (ie. forgetting to pass crudQuery).
     */
    crudQuery: CrudQuery;
    excludeForbiddenPaths?: boolean;
    prismaTransaction?: any; // TODO: Import type when available
};

export interface CrudServiceOpts {
    /** The model name as used by `prismaClient.model`. Eg: 'user' if your prisma schema contains `model User {}` */
    model: string;
    /** Use this if for some reason you don't want to use the globally provided PrismaService */
    prismaClient?: PrismaClient;
    allowedJoins: string[];
    defaultJoins?: string[];
    forbiddenPaths?: Array<string | RegExp>;
    /** The name of the id field in your prisma schema. Defaults to 'id' */
    idPropertyName?: string;
    paginationConfig?: PaginationConfig;
}

export type PrismaCrudModuleOpts = {
    prismaService: any;
    accessControl?: {
        strict: boolean;
        authDataKey: string;
        getRolesFromAuthDataFn: GetRolesFunction;
    };
};
