import { IsString, IsOptional } from 'class-validator';

export class CreatePersonDto {
    @IsString()
    name: string;

    @IsOptional() @IsString()
    address?: string;

    @IsOptional() @IsString()
    phone?: string;
}
