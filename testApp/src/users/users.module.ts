import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import {
    TransactionUsersController,
    UsersController,
    WithRBACUsersController,
} from './users.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [UsersController, WithRBACUsersController, TransactionUsersController],
    providers: [UsersService, PrismaService],
})
export class UsersModule {}
