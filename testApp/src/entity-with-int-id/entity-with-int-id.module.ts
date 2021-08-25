import { Module } from '@nestjs/common';
import { EntityWithIntIdService } from './entity-with-int-id.service';
import { EntityWithIntIdController } from './entity-with-int-id.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [EntityWithIntIdController],
    providers: [EntityWithIntIdService, PrismaService],
})
export class EntityWithIntIdModule {}
