import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CrudQueryObj, CrudQueryParams } from 'nestjs-prisma-crud';
import { CreateEntityWithIntIdDto } from './dto/create-entity-with-int-id.dto';
import { UpdateEntityWithIntIdDto } from './dto/update-entity-with-int-id.dto';
import { EntityWithIntIdService } from './entity-with-int-id.service';

@Controller('entity-with-int-id')
export class EntityWithIntIdController {
    constructor(private readonly entityWithIntIdService: EntityWithIntIdService) {}

    @Post()
    async create(
        @Body() createEntityWithIntIdDto: CreateEntityWithIntIdDto,
        @CrudQueryParams() crudQuery: CrudQueryObj,
    ) {
        const created = await this.entityWithIntIdService.create(createEntityWithIntIdDto, {
            crudQuery,
        });
        return created;
    }

    @Get()
    async findAll(@CrudQueryParams() crudQuery: CrudQueryObj) {
        const matches = await this.entityWithIntIdService.findMany({ crudQuery });
        return matches;
    }

    @Get(':id')
    async findOne(@Param('id') id: number, @CrudQueryParams() crudQuery: CrudQueryObj) {
        const match = await this.entityWithIntIdService.findOne(+id, { crudQuery });
        return match;
    }

    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() updateEntityWithIntIdDto: UpdateEntityWithIntIdDto,
        @CrudQueryParams() crudQuery: CrudQueryObj,
    ) {
        const updated = await this.entityWithIntIdService.update(+id, updateEntityWithIntIdDto, {
            crudQuery,
        });
        return updated;
    }

    @Delete(':id')
    async remove(@Param('id') id: number, @CrudQueryParams() crudQuery: CrudQueryObj) {
        return this.entityWithIntIdService.remove(+id, { crudQuery });
    }
}
