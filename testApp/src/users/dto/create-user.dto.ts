import { Prisma } from '.prisma/client';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
    @IsNotEmpty()
    @IsString()
    email: string;
    @IsOptional()
    @IsString()
    name?: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsArray()
    posts?: Prisma.PostCreateNestedManyWithoutAuthorInput;
    //   @IsOptional()
    //   @IsArray()
    //   comments?: Prisma.CommentCreateNestedManyWithoutAuthorInput;

    @IsOptional()
    @IsObject()
    profile: Prisma.ProfileCreateNestedOneWithoutUserInput;

    @IsNotEmpty()
    @IsObject()
    country: Prisma.CountryCreateNestedOneWithoutUserInput;

    constructor(partial: Partial<CreateUserDto>) {
        Object.assign(this, partial);
    }
}
