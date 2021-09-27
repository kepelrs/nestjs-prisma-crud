import { Injectable } from '@nestjs/common';
import { PrismaCrudService } from 'nestjs-prisma-crud';

@Injectable()
export class EntityWithIntIdService extends PrismaCrudService {
    constructor() {
        super({
            model: 'entityWithIntId',
            idPropertyName: 'exampleDifferentIdName',
            allowedJoins: ['user'],
            defaultJoins: [],
        });
    }
}
