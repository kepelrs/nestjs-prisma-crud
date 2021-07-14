import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
    SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AnyClass } from '../helper-types';
import { GetRolesFunction, RBAC, RbacParams } from './default-policies';

export const ACCESS_POLICY_OPTS = 'ACCESS_POLICY_OPTS';
const POLICY_KEY = 'ACCESS_POLICY_METADATA_KEY';

type PolicyMethod = (
    ctx: ExecutionContext,
    authData: any,
    opts: AccessPolicyInterceptorOpts,
) => void | any;
type AccessPolicyConfig = [RbacParams, ...PolicyMethod[]];

export interface AccessPolicyInterceptorOpts {
    authDataKey: string;
    getRolesFromAuthDataFn: GetRolesFunction;
    strictMode: boolean;
    notImplementedExceptionClass: AnyClass;
    unauthorizedExceptionClass: AnyClass;
    forbiddenExceptionClass: AnyClass;
    internalServerErrorExceptionClass: AnyClass;
}

/**
 * Example usage:
 *
 * ```
 * > @AccessPolicy(config)
 * > @Controller('my-route')
 * > export class HabitController {}
 * ```
 */
export const AccessPolicy = (...policyConfigs: AccessPolicyConfig) =>
    SetMetadata(POLICY_KEY, policyConfigs);

@Injectable()
export class AccessPolicyInterceptor implements NestInterceptor {
    private reflector = new Reflector();

    constructor(
        @Inject(ACCESS_POLICY_OPTS)
        private opts: AccessPolicyInterceptorOpts,
    ) {}

    intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
        const policyConfigs = this.reflector.get<AccessPolicyConfig>(POLICY_KEY, ctx.getHandler()); // ctx.getClass(): https://github.com/nestjs/nest/issues/2027#issuecomment-484430871
        if (!policyConfigs?.length) {
            // Route not decorated with AccessPolicyInterceptor
            if (this.opts.strictMode) {
                // non strictMode does not allow empty policyConfigs
                throw new this.opts.notImplementedExceptionClass(
                    'AccessPolicy: policies not implemented!',
                );
            } else {
                // non strict mode assumes empty policyConfigs means no need for policies!
                return next.handle();
            }
        }

        // if this code is reached, policyConfigs are not empty
        const request = ctx.switchToHttp().getRequest();
        const authData = request[this.opts.authDataKey];
        const policies: PolicyMethod[] = [
            RBAC(policyConfigs[0], authData, this.opts),
            ...(policyConfigs.slice(1) as PolicyMethod[]),
        ];

        // Apply policies
        for (let i = 0; i < policies.length; i++) {
            const policy = policies[i];
            policy(ctx, authData, this.opts);
        }

        return next.handle();
    }
}
