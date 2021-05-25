import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, WithRBACUsersController } from './users.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [UsersController, WithRBACUsersController],
    providers: [UsersService, PrismaService],
})
export class UsersModule {}
