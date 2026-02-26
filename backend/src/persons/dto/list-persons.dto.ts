import { IsOptional, IsIn } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export type PersonSortBy =
    | 'name'
    | 'phone'
    | 'createdAt';

export class ListPersonsDto extends PaginationDto {
    @IsIn(['name', 'phone', 'createdAt'])
    @IsOptional()
    sortBy: PersonSortBy = 'name';
}
