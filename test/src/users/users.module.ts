import { Module } from '@nestjs/common';
import {
    TransactionUsersController,
    UsersController,
    WithRBACUsersController,
} from './users.controller';
import { UsersService } from './users.service';

@Module({
    controllers: [UsersController, WithRBACUsersController, TransactionUsersController],
    providers: [UsersService],
})
export class UsersModule {}
