import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import {
    AccessPolicy,
    MustMatchAuthAttribute,
    MustMatchValue,
    PrismaCrudService,
} from 'nestjs-prisma-crud';
import { seedEntityIds } from '../../prisma/seed';
import { RoleID } from '../authentication.middleware';
import { PrismaService } from '../prisma.service';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get(':id')
    async findOne(@Param('id') id: string, @Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findOne(id, crudQuery);
        return match;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Query('crudQuery') crudQuery: string) {
        return this.commentsService.remove(id, crudQuery);
    }
}

/**
 * For testing MustMatchAuthAttribute
 */
@Controller('must-match-auth-attribute/comments')
@AccessPolicy(['invalid-fc59d9f9']) // fc59d9f9 TODO: document and add separate tests for this .getAllAndOverride functionality
export class WithMustMatchAuthAttributePolicyCommentsController {
    private readonly commentsService = new PrismaCrudService({
        prismaClient: this.prismaService,
        model: 'comment',
        allowedJoins: ['post.author'],
    });

    constructor(private readonly prismaService: PrismaService) {}

    /**
     * GET
     */
    @Get('everyone')
    @AccessPolicy('everyone', MustMatchAuthAttribute('post.author.id', 'id')) // fc59d9f9 TODO: document and add separate tests for this .getAllAndOverride functionality
    async getEveryone(@Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findMany(crudQuery);
        return match;
    }

    @Get('anyAuthenticated')
    @AccessPolicy('anyAuthenticated', MustMatchAuthAttribute('post.author.id', 'id'))
    async getAnyAuthenticated(@Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findMany(crudQuery);
        return match;
    }

    @Get('specificRoles')
    @AccessPolicy([RoleID.ALWAYS_ACCESS], MustMatchAuthAttribute('post.author.id', 'id'))
    async getspecificRoles(@Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findMany(crudQuery);
        return match;
    }

    @Patch('everyone/:id')
    @AccessPolicy('everyone', MustMatchAuthAttribute('post.author.id', 'id'))
    async patchEveryone(
        @Param('id') id: string,
        @Body() body: any,
        @Query('crudQuery') crudQuery: string,
    ) {
        const updated = await this.commentsService.update(id, body, crudQuery);
        return updated;
    }

    @Delete('everyone/:id')
    @AccessPolicy('everyone', MustMatchAuthAttribute('post.author.id', 'id'))
    async deleteEveryone(@Param('id') id: string, @Query('crudQuery') crudQuery: string) {
        const deleted = await this.commentsService.remove(id, crudQuery);
        return deleted;
    }
}

/**
 * For testing MustMatchValue
 */
@Controller('must-match-value/comments')
export class WithMustMatchValuePolicyCommentsController {
    private readonly commentsService = new PrismaCrudService({
        prismaClient: this.prismaService,
        model: 'comment',
        allowedJoins: ['post.author'],
    });

    constructor(private readonly prismaService: PrismaService) {}

    /**
     * GET
     */
    @Get('everyone')
    @AccessPolicy('everyone', MustMatchValue('post.author.id', seedEntityIds[0]))
    async getEveryone(@Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findMany(crudQuery);
        return match;
    }

    @Get('everyone/empty')
    @AccessPolicy(
        'everyone',
        MustMatchValue('post.author.id', 'this string makes this route always return empty set'),
    )
    async getEveryoneEmpty(@Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findMany(crudQuery);
        return match;
    }

    @Get('everyone/null')
    @AccessPolicy('everyone', MustMatchValue('post.author.id', null))
    async getEveryoneUndefined(@Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findMany(crudQuery);
        return match;
    }

    @Get('anyAuthenticated')
    @AccessPolicy('anyAuthenticated', MustMatchValue('post.author.id', seedEntityIds[0]))
    async getAnyAuthenticated(@Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findMany(crudQuery);
        return match;
    }

    @Get('anyAuthenticated/empty')
    @AccessPolicy(
        'anyAuthenticated',
        MustMatchValue('post.author.id', 'this string makes this route always return empty set'),
    )
    async getAnyAuthenticatedEmpty(@Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findMany(crudQuery);
        return match;
    }

    @Get('specificRoles')
    @AccessPolicy([RoleID.ALWAYS_ACCESS], MustMatchValue('post.author.id', seedEntityIds[0]))
    async getspecificRoles(@Query('crudQuery') crudQuery: string) {
        const match = await this.commentsService.findMany(crudQuery);
        return match;
    }

    @Patch('everyone/:id')
    @AccessPolicy('everyone', MustMatchValue('post.author.id', seedEntityIds[0]))
    async patchEveryone(
        @Param('id') id: string,
        @Body() body: any,
        @Query('crudQuery') crudQuery: string,
    ) {
        const updated = await this.commentsService.update(id, body, crudQuery);
        return updated;
    }

    @Delete('everyone/:id')
    @AccessPolicy('everyone', MustMatchValue('post.author.id', seedEntityIds[0]))
    async deleteEveryone(@Param('id') id: string, @Query('crudQuery') crudQuery: string) {
        const deleted = await this.commentsService.remove(id, crudQuery);
        return deleted;
    }
}
