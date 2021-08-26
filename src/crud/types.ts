import { PrismaClient } from '@prisma/client';

export type PaginationDefaults = {
    pageSize: number;
    orderBy: any;
};

export type PrismaTransaction = Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

export type CrudQuery = {
    where?: CrudWhere;
    joins?: string[];
    select?: { only?: string[]; except?: string[] };
    orderBy?: object;
    page?: number;
    pageSize?: number;
};

export type CrudWhere = any;

export type CrudMethodOpts = {
    // TODO: 1. move crudQuery into crudMethodOpts. 2. Update transaction support example
    excludeForbiddenPaths?: boolean;
    prismaTransaction?: PrismaTransaction;
};

export interface CrudServiceOpts {
    /** The model name as used by `prismaClient.model`. Eg: 'user' if your prisma schema contains `model User {}` */
    model: string;
    prismaClient: PrismaClient;
    allowedJoins: string[];
    defaultJoins?: string[];
    forbiddenPaths?: Array<string | RegExp>;
    /** The name of the id field in your prisma schema. Defaults to 'id' */
    idPropertyName?: string;
}
