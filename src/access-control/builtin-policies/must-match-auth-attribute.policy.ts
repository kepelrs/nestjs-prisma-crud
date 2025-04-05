import {
    ExecutionContext,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PolicyMethod } from '../';
import { CrudQueryObj } from '../../crud/types';
import { createWhereObject, getNestedProperty } from '../../crud/utils';

export const MustMatchAuthAttribute = (
    modelAttributePath: string,
    authDataAttributePath: string,
): PolicyMethod => (
    crudQuery: CrudQueryObj,
    authData: any,
    _ctx: ExecutionContext,
    _moduleRef: ModuleRef,
) => {
    if (!authData) {
        throw new UnauthorizedException('This route requires user to be logged in!');
    }

    const targetValue = getNestedProperty(authData, authDataAttributePath);
    if (!targetValue) {
        throw new InternalServerErrorException(
            `MustMatchAuthAttribute policy: authDataAttributePath led to falsy value.`, // TODO: Document that this is not allowed due to edge cases (including the filter being completely ignored when undefined)
        );
    }

    const originalWhere = crudQuery?.where || {};
    return {
        ...crudQuery,
        where: {
            AND: [createWhereObject(modelAttributePath, targetValue), originalWhere],
        },
    };
};
