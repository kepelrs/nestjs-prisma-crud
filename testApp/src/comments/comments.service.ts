import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaCrudService } from '../../../src';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentsService extends PrismaCrudService {
    constructor(public prismaService: PrismaService) {
        super({
            repo: prismaService.comment,
            allowedJoins: ['post'],
            defaultJoins: [],
            notFoundError: new NotFoundException(),
            forbiddenError: new ForbiddenException(),
        });
    }
}

/** Invalid class for testing purposes (allowedJoins/defaultJoins mismatch) */
@Injectable()
export class InvalidCommentsService extends PrismaCrudService {
    constructor(public prismaService: PrismaService) {
        super({
            repo: prismaService.comment,
            allowedJoins: ['post'],
            defaultJoins: ['post', 'post.comments'],
            notFoundError: new NotFoundException(),
            forbiddenError: new ForbiddenException(),
        });
    }
}
