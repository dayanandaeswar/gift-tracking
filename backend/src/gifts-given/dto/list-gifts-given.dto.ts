import { IsOptional, IsIn, IsInt } from 'class-validator';
import { Type } from 'class-transformer';          // ✅ correct package
import { PaginationDto } from '../../common/dto/pagination.dto';

export type GiftGivenSortBy =
    | 'functionName'
    | 'giftType'
    | 'amount'
    | 'givenDate'
    | 'createdAt';

export class ListGiftsGivenDto extends PaginationDto {
    @IsIn(['functionName', 'giftType', 'amount', 'givenDate', 'createdAt'])
    @IsOptional()
    sortBy: GiftGivenSortBy = 'givenDate';

    @Type(() => Number)                              // ✅ from class-transformer
    @IsInt()
    @IsOptional()
    personId?: number;
}
