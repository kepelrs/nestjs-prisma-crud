import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';

@Injectable()
export class UsersService extends PrismaCrudService {
    constructor() {
        super({
            model: 'user',
            allowedJoins: ['posts.comments', 'profile', 'country', 'entitiesWithIntId'],
            forbiddenPaths: ['password', /comments\.\d+\.exampleForbiddenProperty$/],
            paginationConfig: { maxPageSize: 3 },
        });
    }
}
