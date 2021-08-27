import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PolicyMethod } from '../';
import { CrudQuery } from '../../crud/types';
import { createWhereObject } from '../../crud/utils';

export const MustMatchValue = (entityAttributePath: string, targetValue: any): PolicyMethod => (
    ctx: ExecutionContext,
    _authData: any,
    _moduleRef: ModuleRef,
) => {
    if (!targetValue) {
        throw new InternalServerErrorException(
            `MustMatchValue policy: targetValue may not be a falsy value.`, // TODO: Document that this is not allowed due to edge cases (including the filter being completely ignored when undefined)
        );
    }

    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    const crudQuery: string = query.crudQuery;

    const parsedCrudQuery: CrudQuery = crudQuery ? JSON.parse(crudQuery) : {};
    const originalWhere = parsedCrudQuery.where || {};
    parsedCrudQuery.where = {
        AND: [createWhereObject(entityAttributePath, targetValue), originalWhere],
    };

    request.query.crudQuery = JSON.stringify(parsedCrudQuery);
};
