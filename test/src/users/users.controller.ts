import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { AccessPolicy, CrudQueryObj, CrudQueryParams } from 'nestjs-prisma-crud';
import { RoleID } from '../authentication.middleware';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto, @CrudQueryParams() crudQuery: CrudQueryObj) {
        const created = await this.usersService.create(createUserDto, { crudQuery });
        return created;
    }

    @Get()
    async findMany(@CrudQueryParams() crudQuery: CrudQueryObj) {
        const matches = await this.usersService.findMany({ crudQuery });
        return matches;
    }

    @Get('parsedCrudQuery')
    async findManyWithParsedCrudQuery(@Query('crudQuery') crudQuery: string) {
        const matches = await this.usersService.findMany(JSON.parse(crudQuery));
        return matches;
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @CrudQueryParams() crudQuery: CrudQueryObj) {
        const match = await this.usersService.findOne(id, { crudQuery });
        return match;
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @CrudQueryParams() crudQuery: CrudQueryObj,
    ) {
        const updated = await this.usersService.update(id, updateUserDto, { crudQuery });
        return updated;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @CrudQueryParams() crudQuery: CrudQueryObj) {
        return this.usersService.remove(id, { crudQuery });
    }
}

@Controller('rbac/users')
export class WithRBACUsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('everyone')
    @AccessPolicy('everyone')
    async findMany(@CrudQueryParams() crudQuery: CrudQueryObj) {
        const matches = await this.usersService.findMany({ crudQuery });
        return matches;
    }

    @Get('anyRole')
    @AccessPolicy('anyRole')
    async findManyAuthententicated(@CrudQueryParams() crudQuery: CrudQueryObj) {
        const matches = await this.usersService.findMany({ crudQuery });
        return matches;
    }

    @Get('specificRoles')
    @AccessPolicy([RoleID.ALWAYS_ACCESS])
    async findManySpecificRoles(@CrudQueryParams() crudQuery: CrudQueryObj) {
        const matches = await this.usersService.findMany({ crudQuery });
        return matches;
    }
}

/** Controller is used for testing transaction support when extending route functionality */
@Controller('transaction-support/users')
export class TransactionUsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly prismaService: PrismaService,
    ) {}

    private createLog(logContent: string, prismaTransaction?: any) {
        prismaTransaction = prismaTransaction || this.prismaService;

        return prismaTransaction.auditLog.create({
            data: { content: `some example log: ${logContent}` },
        });
    }

    @Post('no-transaction')
    async createWithoutTransaction(
        @Body() createUserDto: CreateUserDto,
        @CrudQueryParams() crudQuery: CrudQueryObj,
    ) {
        try {
            await this.createLog('example');
            const created = await this.usersService.create(
                { ...createUserDto, someInvalidProp: true }, // someInvalidProp causes this line to throw
                { crudQuery },
            );
            await this.createLog('example');
            return created;
        } catch (e) {
            throw new InternalServerErrorException();
        }
    }

    @Post('fail')
    async createFailWithTransaction(
        @Body() createUserDto: CreateUserDto,
        @CrudQueryParams() crudQuery: CrudQueryObj,
    ) {
        try {
            let createdUser;
            await this.prismaService.$transaction(async (prismaTransaction) => {
                await this.createLog('example', prismaTransaction);
                createdUser = await this.usersService.create(
                    { ...createUserDto, someInvalidProp: true }, // someInvalidProp causes this line to throw
                    {
                        crudQuery,
                        prismaTransaction,
                    },
                );
                await this.createLog('example', prismaTransaction);
            });

            return createdUser;
        } catch (error) {
            throw new InternalServerErrorException();
        }
    }

    @Post('success')
    async createSuccessWithTransaction(
        @Body() createUserDto: CreateUserDto,
        @CrudQueryParams() crudQuery: CrudQueryObj,
    ) {
        let createdUser;
        await this.prismaService.$transaction(async (prismaTransaction) => {
            await this.createLog('example', prismaTransaction);
            createdUser = await this.usersService.create(
                { ...createUserDto },
                {
                    crudQuery,
                    prismaTransaction,
                },
            );
            await this.createLog('example', prismaTransaction);
        });

        return createdUser;
    }
}
