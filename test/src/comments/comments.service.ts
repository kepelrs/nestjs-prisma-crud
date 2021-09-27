import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';

@Injectable()
export class CommentsService extends PrismaCrudService {
    constructor() {
        super({
            model: 'comment',
            allowedJoins: ['post'],
            defaultJoins: [],
        });
    }
}

/** Invalid class for testing purposes (allowedJoins/defaultJoins mismatch) */
@Injectable()
export class InvalidCommentsService extends PrismaCrudService {
    constructor() {
        super({
            model: 'comment',
            allowedJoins: ['post'],
            defaultJoins: ['post', 'post.comments'],
        });
    }
}
