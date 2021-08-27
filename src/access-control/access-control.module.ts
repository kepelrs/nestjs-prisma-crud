import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AccessPolicyInterceptorOpts } from './types';
import { ACCESS_POLICY_OPTS_KEY } from './constants';
import { AccessPolicyInterceptor } from './access-policy.interceptor';

@Module({})
export class AccessControlModule {
    static register(opts: AccessPolicyInterceptorOpts): DynamicModule {
        return {
            global: true,
            module: AccessControlModule,
            providers: [
                {
                    provide: ACCESS_POLICY_OPTS_KEY,
                    useValue: opts,
                },
                AccessPolicyInterceptor,
                {
                    provide: APP_INTERCEPTOR,
                    useClass: AccessPolicyInterceptor,
                },
            ],
            exports: [AccessPolicyInterceptor, ACCESS_POLICY_OPTS_KEY],
        };
    }
}
