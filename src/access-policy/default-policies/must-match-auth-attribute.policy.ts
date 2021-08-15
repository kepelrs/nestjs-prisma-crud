import {
    ExecutionContext,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { CrudObj } from '../..';
import { createWhereObject, getNestedProperty } from '../../utils';

// TODO: improve naming.
// TODO: make more generic version that allows for any prisma operator: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#filter-conditions-and-operators
/** TODO: Document. Policy will throw if authDataAttributePath leads into a falsy value */
export const MustMatchAuthAttribute = (
    entityAttributePath: string,
    authDataAttributePath: string,
) => (ctx: ExecutionContext, authData: any) => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;
    const crudQ: string = query.crudQ;

    if (!authData) {
        throw new UnauthorizedException('This route requires user to be logged in!');
    }

    const targetValue = getNestedProperty(authData, authDataAttributePath);
    if (!targetValue) {
        throw new InternalServerErrorException(
            `MustMatchAuthAttribute policy: authDataAttributePath led to falsy value.`, // TODO: Document that this is not allowed due to edge cases (including the filter being completely ignored when undefined)
        );
    }

    const parsedCrudQ: CrudObj = crudQ ? JSON.parse(crudQ) : {};
    const originalWhere = parsedCrudQ.where || {};
    parsedCrudQ.where = {
        AND: [createWhereObject(entityAttributePath, targetValue), originalWhere],
    };

    request.query.crudQ = JSON.stringify(parsedCrudQ);
};
