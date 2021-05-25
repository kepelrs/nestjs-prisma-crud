import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaCrudService } from '../../../src/index';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService extends PrismaCrudService {
    constructor(public prismaService: PrismaService) {
        super({
            repo: prismaService.user,
            allowedJoins: ['posts.comments'],
            notFoundError: new NotFoundException(),
            forbiddenError: new ForbiddenException(),
        });
    }
}
