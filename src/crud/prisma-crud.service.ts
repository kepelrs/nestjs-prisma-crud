import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { deleteObjectProperties, getAllJoinSubsets } from './helpers';
import { PrismaQueryBuilder } from './prisma-query-builder';
import { CrudMethodOpts, CrudServiceOpts, PaginationConfig } from './types';

const DEFAULT_CRUD_METHOD_OPTS: Required<CrudMethodOpts> = {
    crudQuery: {},
    excludeForbiddenPaths: true,
    prismaTransaction: undefined,
};

export class PrismaCrudService {
    public static prismaClient: PrismaClient;
    private paginationConfig: Required<PaginationConfig>;
    private allowedJoinsSet: Set<string>;
    private defaultJoins: string[];
    private prismaClient: any;
    private model: string;
    private forbiddenPaths: Array<string | RegExp>;
    private idPropertyName: string;
    private prismaQueryBuilder: PrismaQueryBuilder;

    constructor(args: CrudServiceOpts) {
        this.model = args.model;
        this.prismaClient = args.prismaClient || PrismaCrudService.prismaClient;
        this.idPropertyName = args.idPropertyName || 'id';

        this.allowedJoinsSet = getAllJoinSubsets(args.allowedJoins);
        this.defaultJoins = this.setDefaultJoins(args.defaultJoins, this.allowedJoinsSet);

        this.forbiddenPaths = args.forbiddenPaths || [];

        this.paginationConfig = this.setPaginationConfig(args.paginationConfig);
        this.prismaQueryBuilder = new PrismaQueryBuilder({
            defaultJoins: this.defaultJoins,
            paginationConfig: this.paginationConfig,
            idPropertyName: this.idPropertyName,
            allowedJoinsSet: this.allowedJoinsSet,
        });
    }

    private setDefaultJoins(
        defaultJoins: string[] | undefined | null,
        allowedJoinsSet: Set<string>,
    ): string[] {
        if (!(defaultJoins instanceof Array)) {
            return Array.from(allowedJoinsSet); // defaultJoins equals allowedJoins when not specified
        }

        for (let i = 0; i < defaultJoins.length; i++) {
            const join = defaultJoins[i];
            if (!allowedJoinsSet.has(join)) {
                throw new InternalServerErrorException(
                    `defaultJoins contains strings that are not preset in allowedJoins`,
                );
            }
        }

        return Array.from(new Set(defaultJoins));
    }

    private setPaginationConfig(userConfig?: PaginationConfig): Required<PaginationConfig> {
        const PAGINATION_DEFAULTS: Required<PaginationConfig> = {
            defaultPageSize: 25,
            maxPageSize: 100,
            defaultOrderBy: [{ [this.idPropertyName]: 'asc' }],
        };

        const paginationConfig = Object.assign({}, PAGINATION_DEFAULTS, userConfig);
        return paginationConfig;
    }

    private getFullCrudOpts(controllerOpts: CrudMethodOpts): Required<CrudMethodOpts> {
        return Object.assign({}, DEFAULT_CRUD_METHOD_OPTS, controllerOpts);
    }

    private getRepo(opts: CrudMethodOpts) {
        const prismaTransaction = opts.prismaTransaction || this.prismaClient;
        return prismaTransaction[this.model];
    }

    public async create(createDto: any, opts: CrudMethodOpts) {
        const fullOpts = this.getFullCrudOpts(opts);
        const repo = this.getRepo(fullOpts);

        const entity = await repo.create({
            data: this.prismaQueryBuilder.buildCreateQuery(createDto),
        });
        return this.findOne(entity[this.idPropertyName], fullOpts);
    }

    public async findMany(opts: CrudMethodOpts) {
        const fullOpts = this.getFullCrudOpts(opts);
        const repo = this.getRepo(fullOpts);

        const parsedCrudQuery = this.prismaQueryBuilder.parseCrudQuery(fullOpts.crudQuery);
        const { findManyQuery, pagination } = this.prismaQueryBuilder.buildFindManyQuery(
            parsedCrudQuery,
        );
        const { orderBy, page, pageSize } = pagination;

        const summary = await repo.aggregate({
            where: findManyQuery.where,
            _count: { [this.idPropertyName]: true },
        });
        const count = summary._count[this.idPropertyName];
        const recordsPerPage = pageSize;
        const pageCount = Math.ceil(count / recordsPerPage);

        let matches = await repo.findMany(findManyQuery);

        if (fullOpts.excludeForbiddenPaths) {
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                deleteObjectProperties(match, this.forbiddenPaths);
            }
        }

        if (parsedCrudQuery.select.only?.length || parsedCrudQuery.select.except?.length) {
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                deleteObjectProperties(
                    match,
                    parsedCrudQuery.select.except,
                    parsedCrudQuery.select.only,
                    true,
                );
            }
        }

        return {
            data: matches,
            totalRecords: count,
            pageCount,
            page,
            pageSize,
            orderBy,
        };
    }

    public async findOne(id: string | number, opts: CrudMethodOpts) {
        if (id === null || id === undefined) {
            throw new InternalServerErrorException(`findOne received invalid id ${id}`);
        }

        const fullOpts = this.getFullCrudOpts(opts);
        const repo = this.getRepo(fullOpts);

        const parsedCrudQuery = this.prismaQueryBuilder.parseCrudQuery(fullOpts.crudQuery);
        const findOneQuery = this.prismaQueryBuilder.buildFindOneQuery(parsedCrudQuery, id);

        let match = await repo.findFirst(findOneQuery);
        if (!match) {
            throw new NotFoundException();
        }

        if (fullOpts.excludeForbiddenPaths) {
            deleteObjectProperties(match, this.forbiddenPaths);
        }

        if (parsedCrudQuery.select.only?.length || parsedCrudQuery.select.except?.length) {
            deleteObjectProperties(
                match,
                parsedCrudQuery.select.except,
                parsedCrudQuery.select.only,
                true,
            );
        }
        return match;
    }

    public async update(id: string | number, updateDto: any, opts: CrudMethodOpts) {
        const fullOpts = this.getFullCrudOpts(opts);
        const repo = this.getRepo(fullOpts);

        // Checks that entity is accessible considering id and crudQuery restrictions.
        const entity = await this.findOne(id, fullOpts);

        await repo.update({
            where: { [this.idPropertyName]: entity[this.idPropertyName] },
            data: this.prismaQueryBuilder.buildUpdateQuery(updateDto, entity),
        });

        return this.findOne(id, fullOpts);
    }

    public async remove(id: string | number, opts: CrudMethodOpts) {
        const fullOpts = this.getFullCrudOpts(opts);
        const repo = this.getRepo(fullOpts);

        // Checks that entity is accessible considering id and crudQuery restrictions
        const entity = await this.findOne(id, fullOpts);

        await repo.delete({ where: { [this.idPropertyName]: entity[this.idPropertyName] } });

        return null;
    }
}
