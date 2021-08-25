import {
    ExecutionContext,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { CrudQuery, PolicyMethod } from '../..';
import { createWhereObject, getNestedProperty } from '../../utils';

export const MustMatchAuthAttribute = (
    entityAttributePath: string,
    authDataAttributePath: string,
): PolicyMethod => (ctx: ExecutionContext, authData: any, _moduleRef: ModuleRef) => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    const crudQuery: string = query.crudQuery;

    if (!authData) {
        throw new UnauthorizedException('This route requires user to be logged in!');
    }

    const targetValue = getNestedProperty(authData, authDataAttributePath);
    if (!targetValue) {
        throw new InternalServerErrorException(
            `MustMatchAuthAttribute policy: authDataAttributePath led to falsy value.`, // TODO: Document that this is not allowed due to edge cases (including the filter being completely ignored when undefined)
        );
    }

    const parsedCrudQuery: CrudQuery = crudQuery ? JSON.parse(crudQuery) : {};
    const originalWhere = parsedCrudQuery.where || {};
    parsedCrudQuery.where = {
        AND: [createWhereObject(entityAttributePath, targetValue), originalWhere],
    };

    request.query.crudQuery = JSON.stringify(parsedCrudQuery);
};
