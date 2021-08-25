import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
    NotImplementedException,
    SetMetadata,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AllowedRoles, GetRolesFunction, RBAC } from './builtin-policies';

export const ACCESS_POLICY_OPTS_KEY = 'ACCESS_POLICY_OPTS_KEY';
export const POLICY_KEY = 'ACCESS_POLICY_METADATA_KEY';

export type PolicyMethod = (
    ctx: ExecutionContext,
    authData: any,
    moduleRef: ModuleRef,
) => void | any;
type AccessPolicyConfig = [AllowedRoles, ...PolicyMethod[]];

export interface AccessPolicyInterceptorOpts {
    authDataKey: string;
    getRolesFromAuthDataFn: GetRolesFunction;
    strictMode: boolean;
}

/**
 * Example usage:
 *
 * ```
 * > @AccessPolicy(config)
 * > @Controller('my-route')
 * > export class MyController {}
 * ```
 */
export const AccessPolicy = (...policyConfigs: AccessPolicyConfig) =>
    SetMetadata(POLICY_KEY, policyConfigs);

@Injectable()
export class AccessPolicyInterceptor implements NestInterceptor {
    private reflector = new Reflector();

    constructor(
        @Inject(ACCESS_POLICY_OPTS_KEY)
        private opts: AccessPolicyInterceptorOpts,
        private moduleRef: ModuleRef,
    ) {}

    async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const policyConfigs = this.reflector.getAllAndOverride<AccessPolicyConfig>(POLICY_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);
        if (!policyConfigs?.length) {
            // Route not decorated with AccessPolicyInterceptor
            if (this.opts.strictMode) {
                // non strictMode does not allow empty policyConfigs
                throw new NotImplementedException('AccessPolicy: policies not implemented!');
            } else {
                // non strict mode assumes empty policyConfigs means no need for policies!
                return next.handle();
            }
        }

        // if this code is reached, policyConfigs are not empty
        const request = ctx.switchToHttp().getRequest();
        const authData = request[this.opts.authDataKey];
        const policies: PolicyMethod[] = [
            RBAC(policyConfigs[0], authData, this.moduleRef),
            ...(policyConfigs.slice(1) as PolicyMethod[]),
        ];

        // Apply policies
        for (let i = 0; i < policies.length; i++) {
            const policy = policies[i];
            await policy(ctx, authData, this.moduleRef);
        }

        return next.handle();
    }
}
