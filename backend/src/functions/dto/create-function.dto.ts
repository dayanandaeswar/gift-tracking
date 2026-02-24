import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateFunctionDto {
    @IsString()
    name: string;

    @IsOptional() @IsString()
    description?: string;

    @IsOptional() @IsDateString()
    eventDate?: string;
}
