import {
    ClassSerializerInterceptor,
    MiddlewareConsumer,
    Module,
    NestModule,
    ValidationPipe,
} from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AccessControlModule } from 'nestjs-prisma-crud';
import { AuthenticationMiddleware } from './authentication.middleware';
import { CommentsModule } from './comments/comments.module';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { EntityWithIntIdModule } from './entity-with-int-id/entity-with-int-id.module';

function createModuleMetadata(opts: { strictMode: boolean }) {
    return {
        imports: [
            UsersModule,
            CommentsModule,
            EntityWithIntIdModule,
            AccessControlModule.register({
                authDataKey: 'user',
                getRolesFromAuthDataFn: (authData) => authData?.roles?.map((r) => r.name),
                strictMode: opts.strictMode,
            }),
        ],
        controllers: [],
        providers: [
            PrismaService,
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
