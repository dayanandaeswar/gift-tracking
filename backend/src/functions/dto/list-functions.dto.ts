import { IsOptional, IsIn } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export type FunctionSortBy =
    | 'name'
    | 'eventDate'
    | 'createdAt';

export class ListFunctionsDto extends PaginationDto {
    @IsIn(['name', 'eventDate', 'createdAt'])
    @IsOptional()
    sortBy: FunctionSortBy = 'eventDate';
}
