import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Patch,
    Query,
} from '@nestjs/common';
import { AccessPolicy, PrismaCrudService } from 'nestjs-prisma-crud';
import { MustMatchAuthAttribute, MustMatchValue } from 'nestjs-prisma-crud';
import { dummySeedValueString } from '../../prisma/seed';
import { RoleID } from '../authentication.middleware';
import { PrismaService } from '../prisma.service';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) {}

    @Get(':id')
    async findOne(@Param('id') id: string, @Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findOne(id, crudQ);
        return match;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Query('crudQ') crudQ?: string) {
        return this.commentsService.remove(id, crudQ);
    }
}

/**
 * For testing MustMatchAuthAttribute
 */
@Controller('must-match-auth-attribute/comments')
export class WithMustMatchAuthAttributePolicyCommentsController {
    private readonly commentsService = new PrismaCrudService({
        repo: this.prismaService.comment,
        allowedJoins: ['post.author'], // TODO: feat - mechanism to enable MustMatchAuthAttribute paths to go beyond allowed joins
        notFoundError: new NotFoundException(),
        forbiddenError: new ForbiddenException(),
    });

    constructor(private readonly prismaService: PrismaService) {}

    /**
     * GET
     */
    @Get('everyone')
    @AccessPolicy('everyone', MustMatchAuthAttribute('post.author.id', 'id'))
    async getEveryone(@Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findAll(crudQ);
        return match;
    }

    @Get('anyAuthenticated')
    @AccessPolicy('anyAuthenticated', MustMatchAuthAttribute('post.author.id', 'id'))
    async getAnyAuthenticated(@Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findAll(crudQ);
        return match;
    }

    @Get('specificRoles')
    @AccessPolicy([RoleID.ALWAYS_ACCESS], MustMatchAuthAttribute('post.author.id', 'id'))
    async getspecificRoles(@Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findAll(crudQ);
        return match;
    }

    @Patch('everyone/:id')
    @AccessPolicy('everyone', MustMatchAuthAttribute('post.author.id', 'id'))
    async patchEveryone(
        @Param('id') id: string,
        @Body() body: any,
        @Query('crudQ') crudQ?: string,
    ) {
        const updated = await this.commentsService.update(id, body, crudQ);
        return updated;
    }

    @Delete('everyone/:id')
    @AccessPolicy('everyone', MustMatchAuthAttribute('post.author.id', 'id'))
    async deleteEveryone(@Param('id') id: string, @Query('crudQ') crudQ?: string) {
        const deleted = await this.commentsService.remove(id, crudQ);
        return deleted;
    }
}

/**
 * For testing MustMatchValue
 */
@Controller('must-match-value/comments')
export class WithMustMatchValuePolicyCommentsController {
    private readonly commentsService = new PrismaCrudService({
        repo: this.prismaService.comment,
        allowedJoins: ['post.author'], // TODO: feat - mechanism to enable MustMatchAuthAttribute paths to go beyond allowed joins
        notFoundError: new NotFoundException(),
        forbiddenError: new ForbiddenException(),
    });

    constructor(private readonly prismaService: PrismaService) {}

    /**
     * GET
     */
    @Get('everyone')
    @AccessPolicy('everyone', MustMatchValue('post.author.id', dummySeedValueString))
    async getEveryone(@Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findAll(crudQ);
        return match;
    }

    @Get('everyone/empty')
    @AccessPolicy(
        'everyone',
        MustMatchValue('post.author.id', 'this string makes this route always return empty set'),
    )
    async getEveryoneEmpty(@Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findAll(crudQ);
        return match;
    }

    @Get('everyone/null')
    @AccessPolicy('everyone', MustMatchValue('post.author.id', null))
    async getEveryoneUndefined(@Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findAll(crudQ);
        return match;
    }

    @Get('anyAuthenticated')
    @AccessPolicy('anyAuthenticated', MustMatchValue('post.author.id', dummySeedValueString))
    async getAnyAuthenticated(@Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findAll(crudQ);
        return match;
    }

    @Get('anyAuthenticated/empty')
    @AccessPolicy(
        'anyAuthenticated',
        MustMatchValue('post.author.id', 'this string makes this route always return empty set'),
    )
    async getAnyAuthenticatedEmpty(@Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findAll(crudQ);
        return match;
    }

    @Get('specificRoles')
    @AccessPolicy([RoleID.ALWAYS_ACCESS], MustMatchValue('post.author.id', dummySeedValueString))
    async getspecificRoles(@Query('crudQ') crudQ?: string) {
        const match = await this.commentsService.findAll(crudQ);
        return match;
    }

    @Patch('everyone/:id')
    @AccessPolicy('everyone', MustMatchValue('post.author.id', dummySeedValueString))
    async patchEveryone(
        @Param('id') id: string,
        @Body() body: any,
        @Query('crudQ') crudQ?: string,
    ) {
        const updated = await this.commentsService.update(id, body, crudQ);
        return updated;
    }

    @Delete('everyone/:id')
    @AccessPolicy('everyone', MustMatchValue('post.author.id', dummySeedValueString))
    async deleteEveryone(@Param('id') id: string, @Query('crudQ') crudQ?: string) {
        const deleted = await this.commentsService.remove(id, crudQ);
        return deleted;
    }
}
