import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEntityWithIntIdDto {
    @IsString()
    @IsNotEmpty()
    exampleProperty: string;
}
