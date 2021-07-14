import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessPolicy } from 'nestjs-prisma-crud';
import { RoleID } from '../authentication.middleware';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        const created = await this.usersService.create(createUserDto);
        return created;
    }

    @Get()
    async findAll(@Query('crudQ') crudQ?: string) {
        const matches = await this.usersService.findAll(crudQ);
        return matches;
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Query('crudQ') crudQ?: string) {
        const match = await this.usersService.findOne(id, crudQ);
        return match;
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Query('crudQ') crudQ?: string,
    ) {
        const updated = await this.usersService.update(id, updateUserDto, crudQ);
        return updated;
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Query('crudQ') crudQ?: string) {
        return this.usersService.remove(id, crudQ);
    }
}

@Controller('rbac/users')
export class WithRBACUsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('everyone')
    @AccessPolicy('everyone')
    async findAll(@Query('crudQ') crudQ?: string) {
        const matches = await this.usersService.findAll(crudQ);
        return matches;
    }

    @Get('anyAuthenticated')
    @AccessPolicy('anyAuthenticated')
    async findAllAuthententicated(@Query('crudQ') crudQ?: string) {
        const matches = await this.usersService.findAll(crudQ);
        return matches;
    }

    @Get('specificRoles')
    @AccessPolicy([RoleID.ALWAYS_ACCESS])
    async findAllSpecificRoles(@Query('crudQ') crudQ?: string) {
        const matches = await this.usersService.findAll(crudQ);
        return matches;
    }
}
