import { ExecutionContext } from '@nestjs/common';
import { CrudObj } from '../..';
import { AccessPolicyInterceptorOpts } from '../access-policy.interceptor';

/** TODO: Dry up with other createWhereObject */
const createWhereObject = (fullPath: string, targetValue: any) => {
    const fragments = fullPath.split('.');
    const rootObj: any = {};
    let workingWhereObj = rootObj;
    for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[i];
        const isLastFragment = i === fragments.length - 1;

        workingWhereObj[fragment] = isLastFragment ? targetValue : {};
        workingWhereObj = workingWhereObj[fragment];
    }

    return rootObj;
};

/** TODO: Document */
export const MustMatchValue = (entityAttributePath: string, targetValue: any) => (
    ctx: ExecutionContext,
    _authData: any,
    accessPolicyOpts: AccessPolicyInterceptorOpts,
) => {
    if (!targetValue) {
        throw new accessPolicyOpts.internalServerErrorExceptionClass(
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
