import { PartialType } from '@nestjs/mapped-types';
import { CreateEntityWithIntIdDto } from './create-entity-with-int-id.dto';

export class UpdateEntityWithIntIdDto extends PartialType(CreateEntityWithIntIdDto) {}
