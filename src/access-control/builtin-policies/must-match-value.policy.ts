import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { PolicyMethod } from '../';
import { CrudQueryObj } from '../../crud/types';
import { createWhereObject } from '../../crud/utils';

export const MustMatchValue = (modelAttributePath: string, targetValue: any): PolicyMethod => (
    crudQuery: CrudQueryObj,
    _authData: any,
    _ctx: ExecutionContext,
    _moduleRef: ModuleRef,
) => {
    if (!targetValue) {
        throw new InternalServerErrorException(
            `MustMatchValue policy: targetValue may not be a falsy value.`, // TODO: Document that this is not allowed due to edge cases (including the filter being completely ignored when undefined)
        );
    }

    const originalWhere = crudQuery?.where || {};
    return {
        ...crudQuery,
        where: { AND: [createWhereObject(modelAttributePath, targetValue), originalWhere] },
    };
};
