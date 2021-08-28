import { ForbiddenException } from '@nestjs/common';
import {
    plainToPrismaNestedQuery,
    transformJoinsToInclude,
    validateNestedOrderBy,
    validateNestedWhere,
} from './helpers';
import {
    CrudQuery,
    CrudQueryFull,
    FindManyQuery,
    FindOneQuery,
    PaginationConfig,
    PaginationData,
} from './types';

export class PrismaQueryBuilder {
    private DEFAULT_CRUD_QUERY: CrudQueryFull = {
        where: {},
        joins: this.crudServiceOpts.defaultJoins,
        select: {},
        orderBy: this.crudServiceOpts.paginationConfig.defaultOrderBy,
        page: 1,
        pageSize: this.crudServiceOpts.paginationConfig.defaultPageSize,
    };

    constructor(
        private crudServiceOpts: {
            defaultJoins: string[];
            paginationConfig: Required<PaginationConfig>;
            idPropertyName: string;
            allowedJoinsSet: Set<string>;
        },
    ) {}

    private buildPagination(parsedCrudQuery: CrudQueryFull): PaginationData {
        // TODO: Validate user inputs!!
        let { page, pageSize, orderBy } = parsedCrudQuery;
        page = +page! > 0 ? +page! : 1;
        pageSize =
            +pageSize! > 0 ? +pageSize! : this.crudServiceOpts.paginationConfig.defaultPageSize;
        pageSize =
            pageSize > this.crudServiceOpts.paginationConfig.maxPageSize
                ? this.crudServiceOpts.paginationConfig.maxPageSize
                : pageSize;
        orderBy =
            orderBy instanceof Array
                ? orderBy
                : this.crudServiceOpts.paginationConfig.defaultOrderBy;
        validateNestedOrderBy(orderBy, this.crudServiceOpts.allowedJoinsSet);

        const paginationObj = {
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy,
            page,
            pageSize,
        };

        return paginationObj;
    }

    private buildFindQuery(
        parsedCrudQuery: CrudQueryFull,
        paginationData: PaginationData,
    ): FindManyQuery;
    private buildFindQuery(parsedCrudQuery: CrudQueryFull): FindOneQuery;
    private buildFindQuery(parsedCrudQuery: CrudQueryFull, pagination?: PaginationData) {
        validateNestedWhere(parsedCrudQuery.where, this.crudServiceOpts.allowedJoinsSet);
        // TODO: split buildIncludes into validate and build functions
        const includes = this.buildIncludes(parsedCrudQuery.joins);

        const prismaFindOneQuery: FindOneQuery = {
            ...includes,
            where: parsedCrudQuery.where,
        };
        let prismaFindManyQuery: FindManyQuery = null as FindManyQuery;
        if (pagination) {
            prismaFindManyQuery = { ...prismaFindOneQuery } as FindManyQuery;
            prismaFindManyQuery.orderBy = pagination.orderBy;
            prismaFindManyQuery.skip = pagination.skip;
            prismaFindManyQuery.take = pagination.take;
        }

        return prismaFindManyQuery || prismaFindOneQuery;
    }

    private buildIncludes(requestSpecificIncludes: string[]) {
        const allowedJoins = [];
        for (let i = 0; i < requestSpecificIncludes.length; i++) {
            const reqInclude = requestSpecificIncludes[i];
            if (this.crudServiceOpts.allowedJoinsSet.has(reqInclude)) {
                allowedJoins.push(reqInclude);
            } else {
                throw new ForbiddenException(`Join relation not allowed: ${reqInclude}`);
            }
        }

        return transformJoinsToInclude(Array.from(new Set(allowedJoins)));
    }

    public parseCrudQuery(crudQuery: CrudQuery): CrudQueryFull {
        if (typeof crudQuery === 'string') {
            crudQuery = JSON.parse(crudQuery);
        }

        crudQuery = Object.assign({}, this.DEFAULT_CRUD_QUERY, crudQuery);

        return crudQuery as CrudQueryFull;
    }

    public buildFindManyQuery(parsedCrudQuery: CrudQueryFull) {
        const pagination = this.buildPagination(parsedCrudQuery);
        const findManyQuery = this.buildFindQuery(parsedCrudQuery, pagination);

        return { pagination, findManyQuery };
    }

    public buildFindOneQuery(parsedCrudQuery: CrudQueryFull, id: string | number) {
        const findOneQuery = this.buildFindQuery(parsedCrudQuery);
        findOneQuery.where = { ...findOneQuery.where, [this.crudServiceOpts.idPropertyName]: id };
        return findOneQuery;
    }

    public buildCreateQuery(createDto: any) {
        return plainToPrismaNestedQuery(
            createDto,
            null,
            this.crudServiceOpts.allowedJoinsSet,
            this.crudServiceOpts.idPropertyName,
        );
    }

    public buildUpdateQuery(updateDto: any, persistedEntity: any) {
        return plainToPrismaNestedQuery(
            updateDto,
            persistedEntity,
            this.crudServiceOpts.allowedJoinsSet,
            this.crudServiceOpts.idPropertyName,
        );
    }
}
