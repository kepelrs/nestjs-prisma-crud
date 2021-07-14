import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService extends PrismaCrudService {
    constructor(public prismaService: PrismaService) {
        super({
            repo: prismaService.user,
            allowedJoins: ['posts.comments', 'profile', 'country'],
            forbiddenPaths: ['password', /comments\.\d+\.exampleForbiddenProperty$/],
            notFoundError: new NotFoundException(),
            forbiddenError: new ForbiddenException(),
        });
    }
}
