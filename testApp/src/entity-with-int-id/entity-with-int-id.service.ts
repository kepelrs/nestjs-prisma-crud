import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EntityWithIntIdService extends PrismaCrudService {
    constructor(public prismaService: PrismaService) {
        super({
            prismaClient: prismaService,
            model: 'entityWithIntId',
            idPropertyName: 'exampleDifferentIdName',
            allowedJoins: ['user'],
            defaultJoins: [],
        });
    }
}
