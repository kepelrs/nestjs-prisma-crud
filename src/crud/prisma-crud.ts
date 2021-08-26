import {
    ForbiddenException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import {
    deleteObjectProperties,
    getAllJoinSubsets,
    transformForNestedCreate,
    transformJoinsToInclude,
    validateNestedWhere,
} from './helpers';
import { CrudMethodOpts, PaginationDefaults, CrudServiceOpts, CrudQuery, CrudWhere } from './types';

export const defaultCrudMethodOpts: CrudMethodOpts = {
    crudQuery: {},
    excludeForbiddenPaths: true,
    prismaTransaction: undefined,
};

export class PrismaCrudService {
    private defaultIncludes: any;
    private paginationDefaults: PaginationDefaults;
    private allowedJoinsSet: Set<string>;
    private defaultJoins: string[];
    private prismaClient: any;
    private model: string;
    private forbiddenPaths: Array<string | RegExp>;
    private idPropertyName: string;

    constructor(args: CrudServiceOpts) {
        this.model = args.model;
        this.prismaClient = args.prismaClient;
        this.idPropertyName = args.idPropertyName || 'id';

        this.allowedJoinsSet = getAllJoinSubsets(args.allowedJoins);
        this.defaultJoins = this.getSanitizedDefaultJoins(args.defaultJoins, this.allowedJoinsSet);

        this.defaultIncludes = transformJoinsToInclude(this.defaultJoins);

        this.forbiddenPaths = args.forbiddenPaths || [];

        this.paginationDefaults = {
            pageSize: 25,
            orderBy: [{ [this.idPropertyName]: 'asc' }],
        };
    }

    private getSanitizedDefaultJoins(
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

    private getIncludes(requestSpecificIncludes: string[] | undefined | null) {
        if (!requestSpecificIncludes) {
            return this.defaultIncludes;
        }

        const allowedJoins = [];
        for (let i = 0; i < requestSpecificIncludes.length; i++) {
            const reqInclude = requestSpecificIncludes[i];
            if (this.allowedJoinsSet.has(reqInclude)) {
                allowedJoins.push(reqInclude);
            } else {
                throw new ForbiddenException(`Join relation not allowed: ${reqInclude}`);
            }
        }

        return transformJoinsToInclude(Array.from(new Set(allowedJoins)));
    }

    private parseCrudQuery(crudQuery: undefined | null | string | CrudQuery): CrudQuery {
        if (crudQuery instanceof Object) {
            return crudQuery;
        }

        if (typeof crudQuery === 'string') {
            return JSON.parse(crudQuery);
        }

        return {
            where: {},
            joins: this.defaultJoins,
            select: {},
            orderBy: this.paginationDefaults.orderBy,
            page: 1,
            pageSize: this.paginationDefaults.pageSize,
        };
    }

    private getAndValidateWhere(crudQuery: CrudQuery): CrudWhere {
        const where = crudQuery.where || {};
        validateNestedWhere(where, this.allowedJoinsSet);
        return where;
    }

    private getAndValidatePagination(
        crudQuery: CrudQuery,
    ): {
        skip: number;
        take: number;
        orderBy: any;
        page: number;
        pageSize: number;
    } {
        // TODO: Validate user inputs!!
        let { page, pageSize, orderBy } = crudQuery;
        page = +page! > 0 ? +page! : 1;
        pageSize = +pageSize! > 0 ? +pageSize! : this.paginationDefaults.pageSize;
        orderBy = orderBy instanceof Object ? orderBy : this.paginationDefaults.orderBy;
        const paginationObj = {
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy,
            page,
            pageSize,
        };

        return paginationObj;
    }

    private getRepo(opts: CrudMethodOpts) {
        const prismaTransaction = opts.prismaTransaction || this.prismaClient;
        return prismaTransaction[this.model];
    }

    public async create(createDto: any, opts: CrudMethodOpts) {
        opts = Object.assign({}, defaultCrudMethodOpts, opts);
        const repo = this.getRepo(opts);

        const entity = await repo.create({
            data: transformForNestedCreate(
                createDto,
                null,
                this.allowedJoinsSet,
                this.idPropertyName,
            ),
        });
        return this.findOne(entity[this.idPropertyName], opts);
    }

    public async findMany(opts: CrudMethodOpts) {
        opts = Object.assign({}, defaultCrudMethodOpts, opts);
        const repo = this.getRepo(opts);

        const parsedCrudQuery = this.parseCrudQuery(opts.crudQuery);
        const where = this.getAndValidateWhere(parsedCrudQuery);
        const { skip, take, orderBy, page, pageSize } = this.getAndValidatePagination(
            parsedCrudQuery,
        );

        const summary = await repo.aggregate({
            where,
            _count: { [this.idPropertyName]: true },
        });
        const count = summary._count[this.idPropertyName];
        const recordsPerPage = take;
        const pageCount = Math.ceil(count / recordsPerPage);

        let matches = await repo.findMany({
            where: { ...where },
            ...this.getIncludes(parsedCrudQuery.joins),
            skip,
            take,
        });

        if (opts.excludeForbiddenPaths) {
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                deleteObjectProperties(match, this.forbiddenPaths);
            }
        }

        if (parsedCrudQuery.select) {
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
        opts = Object.assign({}, defaultCrudMethodOpts, opts);
        const repo = this.getRepo(opts);

        const parsedCrudQuery = this.parseCrudQuery(opts.crudQuery);
        const where = this.getAndValidateWhere(parsedCrudQuery);

        let match = await repo.findFirst({
            where: { ...where, [this.idPropertyName]: id },
            ...this.getIncludes(parsedCrudQuery.joins),
        });

        if (!match) {
            throw new NotFoundException();
        }

        if (opts.excludeForbiddenPaths) {
            deleteObjectProperties(match, this.forbiddenPaths);
        }

        if (parsedCrudQuery.select) {
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
        opts = Object.assign({}, defaultCrudMethodOpts, opts);
        const repo = this.getRepo(opts);

        // Check that entity is accessible considering id and crudQuery restrictions
        const entity = await this.findOne(id, opts);

        // update and return standard findOne
        await repo.update({
            where: { [this.idPropertyName]: entity[this.idPropertyName] },
            data: transformForNestedCreate(
                updateDto,
                entity,
                this.allowedJoinsSet,
                this.idPropertyName,
            ),
        });

        return this.findOne(id, opts);
    }

    public async remove(id: string | number, opts: CrudMethodOpts) {
        opts = Object.assign({}, defaultCrudMethodOpts, opts);
        const repo = this.getRepo(opts);

        // Check that entity is accessible considering id and crudQuery restrictions
        const entity = await this.findOne(id, opts);

        await repo.delete({ where: { [this.idPropertyName]: entity[this.idPropertyName] } });

        return null;
    }
}
