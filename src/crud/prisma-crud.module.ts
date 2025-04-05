import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AccessControlModule } from '../access-control/access-control.module';
import { PrismaCrudService } from './prisma-crud.service';
import { CrudQueryObj, PrismaCrudModuleOpts } from './types';

@Module({})
export class PrismaCrudModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply((req: any, _res: any, next: any) => {
                const crudQueryString = req.query?.crudQuery;
                let crudQueryObj: CrudQueryObj | null = null;
                if (typeof crudQueryString === 'string') {
                    crudQueryObj = JSON.parse(crudQueryString);
                }
                req.crudQuery = crudQueryObj;
                next();
            })
            .forRoutes('*');
    }

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
