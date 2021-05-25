import { Module } from '@nestjs/common';
import { CommentsService, InvalidCommentsService } from './comments.service';
import {
    CommentsController,
    WithMustMatchAuthAttributePolicyCommentsController,
    WithMustMatchValuePolicyCommentsController,
} from './comments.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [
        CommentsController,
        WithMustMatchAuthAttributePolicyCommentsController,
        WithMustMatchValuePolicyCommentsController,
    ],
    providers: [CommentsService, PrismaService],
})
export class CommentsModule {}

/** Invalid class for testing purposes */
@Module({
    controllers: [
        CommentsController,
        WithMustMatchAuthAttributePolicyCommentsController,
        WithMustMatchValuePolicyCommentsController,
    ],
    providers: [InvalidCommentsService, PrismaService],
})
export class InvalidCommentsModule {}
