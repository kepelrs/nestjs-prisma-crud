import { Module } from '@nestjs/common';
import { EntityWithIntIdService } from './entity-with-int-id.service';
import { EntityWithIntIdController } from './entity-with-int-id.controller';

@Module({
    controllers: [EntityWithIntIdController],
    providers: [EntityWithIntIdService],
})
export class EntityWithIntIdModule {}
