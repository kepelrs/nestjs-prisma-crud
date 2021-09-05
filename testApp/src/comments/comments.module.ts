import { Module } from '@nestjs/common';
import { CommentsService, InvalidCommentsService } from './comments.service';
import {
    CommentsController,
    WithMustMatchAuthAttributePolicyCommentsController,
    WithMustMatchValuePolicyCommentsController,
} from './comments.controller';

@Module({
    controllers: [
        CommentsController,
        WithMustMatchAuthAttributePolicyCommentsController,
        WithMustMatchValuePolicyCommentsController,
    ],
    providers: [CommentsService],
})
export class CommentsModule {}

/** Invalid class for testing purposes */
@Module({
    controllers: [
        CommentsController,
        WithMustMatchAuthAttributePolicyCommentsController,
        WithMustMatchValuePolicyCommentsController,
    ],
    providers: [InvalidCommentsService],
})
export class InvalidCommentsModule {}
