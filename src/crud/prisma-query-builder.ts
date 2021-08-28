import { plainToPrismaNestedQuery, transformJoinsToInclude } from './helpers';
import {
    CrudQuery,
    CrudQueryFull,
    FindManyQuery,
    FindOneQuery,
    PaginationConfig,
    PaginationData,
} from './types';
import {
    validateCrudQueryFull,
    validateJoins,
    validateNestedOrderBy,
    validateNestedWhere,
} from './validations';

export class PrismaQueryBuilder {
    private DEFAULT_CRUD_QUERY: CrudQueryFull;

    constructor(
        private crudServiceOpts: {
            defaultJoins: string[];
            paginationConfig: Required<PaginationConfig>;
            idPropertyName: string;
            allowedJoinsSet: Set<string>;
        },
    ) {
        this.DEFAULT_CRUD_QUERY = {
            where: {},
            joins: this.crudServiceOpts.defaultJoins,
            select: {},
            orderBy: this.crudServiceOpts.paginationConfig.defaultOrderBy,
            page: 1,
            pageSize: this.crudServiceOpts.paginationConfig.defaultPageSize,
        };
    }

    private buildPagination(parsedCrudQuery: CrudQueryFull): PaginationData {
        let { page, pageSize, orderBy } = parsedCrudQuery;
        pageSize =
            pageSize > this.crudServiceOpts.paginationConfig.maxPageSize
                ? this.crudServiceOpts.paginationConfig.maxPageSize
                : pageSize;

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
        validateJoins(parsedCrudQuery.joins, this.crudServiceOpts.allowedJoinsSet);
        const includes = transformJoinsToInclude(Array.from(new Set(parsedCrudQuery.joins)));

        const prismaFindOneQuery: FindOneQuery = {
            ...includes,
            where: parsedCrudQuery.where,
        };
        let prismaFindManyQuery: FindManyQuery = (null as unknown) as FindManyQuery;
        if (pagination) {
            prismaFindManyQuery = { ...prismaFindOneQuery } as FindManyQuery;
            prismaFindManyQuery.orderBy = pagination.orderBy;
            prismaFindManyQuery.skip = pagination.skip;
            prismaFindManyQuery.take = pagination.take;
        }

        return prismaFindManyQuery || prismaFindOneQuery;
    }

    public parseCrudQuery(crudQuery: CrudQuery): CrudQueryFull {
        if (typeof crudQuery === 'string') {
            crudQuery = JSON.parse(crudQuery);
        }

        const crudQueryFull = Object.assign(
            {},
            this.DEFAULT_CRUD_QUERY,
            crudQuery,
        ) as CrudQueryFull;

        validateCrudQueryFull(crudQueryFull);

        return crudQueryFull;
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
