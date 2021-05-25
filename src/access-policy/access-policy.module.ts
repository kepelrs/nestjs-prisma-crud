import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
    AccessPolicyInterceptor,
    ACCESS_POLICY_OPTS,
    AccessPolicyInterceptorOpts,
} from './access-policy.interceptor';

@Module({})
export class AccessPolicyModule {
    static register(opts: AccessPolicyInterceptorOpts): DynamicModule {
        return {
            global: true,
            module: AccessPolicyModule,
            providers: [
                {
                    provide: ACCESS_POLICY_OPTS,
                    useValue: opts,
                },
                AccessPolicyInterceptor,
                {
                    provide: APP_INTERCEPTOR,
                    useClass: AccessPolicyInterceptor,
                },
            ],
            exports: [AccessPolicyInterceptor, ACCESS_POLICY_OPTS],
        };
    }
}
