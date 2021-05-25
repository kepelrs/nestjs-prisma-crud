import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AccessPolicyInterceptorOpts, ACCESS_POLICY_OPTS } from '../../src/access-policy';

export enum RoleID {
    ALWAYS_ACCESS = 'ALWAYS_ACCESS',
    LIMITED_ACCESS = 'LIMITED_ACCESS',
}

/**
 * Dummy helper authentication middleware for testing purposes (AccessPolicyModule)
 * Attaches user to the request under .user property.
 * UserId and roles will be whatever was passed as query parameters. Roles may be comma separated values
 */
@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    private authDataKey = this.accessPolicyOpts.authDataKey;

    constructor(
        @Inject(ACCESS_POLICY_OPTS)
        private accessPolicyOpts: AccessPolicyInterceptorOpts,
    ) {}

    async use(request: Request, response: Response, next: NextFunction) {
        const _testingRoles = request.query._testingRoles || '';
        const _userId = request.query._userId === '0' ? 0 : request.query._userId;

        if (_testingRoles || _userId) {
            const roles = (_testingRoles as string)
                .split(',')
                .filter((v) => RoleID[v])
                .map((v) => ({ name: v }));

            (request as any)[this.authDataKey] = { id: _userId, roles };
        }

        next();
    }
}
