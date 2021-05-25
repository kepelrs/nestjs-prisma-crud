import {
    ClassSerializerInterceptor,
    ForbiddenException,
    InternalServerErrorException,
    MiddlewareConsumer,
    Module,
    NestModule,
    NotImplementedException,
    UnauthorizedException,
    ValidationPipe,
} from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AccessPolicyModule } from '../../src';
import { AuthenticationMiddleware } from './authentication.middleware';
import { CommentsModule } from './comments/comments.module';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';

function getModuleMetadata(opts: { strictMode: boolean }) {
    return {
        imports: [
            UsersModule,
            CommentsModule,
            AccessPolicyModule.register({
                authDataKey: 'user',
                getRolesFromAuthDataFn: (authData) => authData?.roles?.map((r) => r.name),
                strictMode: opts.strictMode,
                notImplementedExceptionClass: NotImplementedException, // TODO: better ways of doing this
                unauthorizedExceptionClass: UnauthorizedException,
                forbiddenExceptionClass: ForbiddenException,
                internalServerErrorExceptionClass: InternalServerErrorException,
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
                    forbidNonWhitelisted: true, // requires whitelist: true
                }),
            },
        ],
    };
}

@Module(getModuleMetadata({ strictMode: false }))
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthenticationMiddleware).forRoutes('*');
    }
}

@Module(getModuleMetadata({ strictMode: true }))
export class StrictModeAppModule extends AppModule {}
