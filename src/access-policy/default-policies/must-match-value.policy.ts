import { ExecutionContext, InternalServerErrorException } from '@nestjs/common';
import { CrudObj } from '../..';
import { createWhereObject } from '../../utils';

/** TODO: Document */
export const MustMatchValue = (entityAttributePath: string, targetValue: any) => (
    ctx: ExecutionContext,
    _authData: any,
) => {
    if (!targetValue) {
        throw new InternalServerErrorException(
            `MustMatchValue policy: targetValue may not be a falsy value.`, // TODO: Document that this is not allowed due to edge cases (including the filter being completely ignored when undefined)
        );
    }

    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    const crudQ: string = query.crudQ;

    const parsedCrudQ: CrudObj = crudQ ? JSON.parse(crudQ) : {};
    const originalWhere = parsedCrudQ.where || {};
    parsedCrudQ.where = {
        AND: [createWhereObject(entityAttributePath, targetValue), originalWhere],
    };

    request.query.crudQ = JSON.stringify(parsedCrudQ);
};
