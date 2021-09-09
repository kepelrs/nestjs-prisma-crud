import { DynamicModule, Module } from '@nestjs/common';
import { PrismaCrudService } from './prisma-crud.service';
import { PrismaCrudModuleOpts } from './types';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({})
export class PrismaCrudModule {
    static register(opts: PrismaCrudModuleOpts): DynamicModule {
        const imports = opts.accessControl
            ? [
                  AccessControlModule.register({
                      authDataKey: opts.accessControl.authDataKey,
                      getRolesFromAuthDataFn: opts.accessControl.getRolesFromAuthDataFn,
                      strictMode: opts.accessControl.strict,
                  }),
              ]
            : [];

        PrismaCrudService.prismaClient = PrismaCrudService.prismaClient || new opts.prismaService(); // TODO: implement support for custom providers ({provide, useValue, etc})

        return {
            global: true,
            module: PrismaCrudModule,
            imports,
            providers: [
                { provide: opts.prismaService, useFactory: () => PrismaCrudService.prismaClient },
            ],
            exports: [opts.prismaService],
        };
    }
}
