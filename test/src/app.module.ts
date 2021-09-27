import {
    ClassSerializerInterceptor,
    MiddlewareConsumer,
    Module,
    NestModule,
    ValidationPipe,
} from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { PrismaCrudModule } from 'nestjs-prisma-crud';
import { AuthenticationMiddleware } from './authentication.middleware';
import { CommentsModule } from './comments/comments.module';
import { EntityWithIntIdModule } from './entity-with-int-id/entity-with-int-id.module';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';

function createModuleMetadata(opts: { strictMode: boolean }) {
    return {
        imports: [
            UsersModule,
            CommentsModule,
            EntityWithIntIdModule,
            PrismaCrudModule.register({
                prismaService: PrismaService,
                accessControl: {
                    authDataKey: 'user',
                    strict: opts.strictMode,
                    getRolesFromAuthDataFn: (authData) => authData?.roles?.map((r) => r.name),
                },
            }),
        ],
        controllers: [],
        providers: [
            { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
            {
                provide: APP_PIPE,
                useValue: new ValidationPipe({
                    whitelist: true,
                    // forbidNonWhitelisted: true, // requires whitelist: true
                }),
            },
        ],
    };
}

@Module(createModuleMetadata({ strictMode: false }))
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthenticationMiddleware).forRoutes('*');
    }
}

@Module(createModuleMetadata({ strictMode: true }))
export class StrictModeAppModule extends AppModule {}
