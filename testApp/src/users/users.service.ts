import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService extends PrismaCrudService {
    constructor(public prismaService: PrismaService) {
        super({
            prismaClient: prismaService,
            model: 'user',
            allowedJoins: ['posts.comments', 'profile', 'country', 'entitiesWithIntId'],
            forbiddenPaths: ['password', /comments\.\d+\.exampleForbiddenProperty$/],
        });
    }
}
