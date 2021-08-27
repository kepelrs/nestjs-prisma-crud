import { SetMetadata } from '@nestjs/common';
import { POLICY_KEY } from './constants';
import { AccessPolicyConfig } from './types';

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
