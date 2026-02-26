import { IsInt, IsOptional, IsIn, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';          // ✅ correct package

export class PaginationDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    pageSize: number = 20;

    @IsIn(['asc', 'desc'])
    @IsOptional()
    sortDir: 'asc' | 'desc' = 'asc';
}
