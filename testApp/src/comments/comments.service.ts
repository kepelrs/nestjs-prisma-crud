import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentsService extends PrismaCrudService {
    constructor(public prismaService: PrismaService) {
        super({
            prismaClient: prismaService,
            model: 'comment',
            allowedJoins: ['post'],
            defaultJoins: [],
        });
    }
}

/** Invalid class for testing purposes (allowedJoins/defaultJoins mismatch) */
@Injectable()
export class InvalidCommentsService extends PrismaCrudService {
    constructor(public prismaService: PrismaService) {
        super({
            prismaClient: prismaService,
            model: 'comment',
            allowedJoins: ['post'],
            defaultJoins: ['post', 'post.comments'],
        });
    }
}
