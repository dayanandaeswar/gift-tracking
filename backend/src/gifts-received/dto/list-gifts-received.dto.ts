import { IsOptional, IsIn, IsInt } from 'class-validator';
import { Type } from 'class-transformer';          // ✅ correct package
import { PaginationDto } from '../../common/dto/pagination.dto';

export type GiftReceivedSortBy =
    | 'person'
    | 'giftType'
    | 'amount'
    | 'receivedDate'
    | 'createdAt';

export class ListGiftsReceivedDto extends PaginationDto {
    @IsIn(['person', 'giftType', 'amount', 'receivedDate', 'createdAt'])
    @IsOptional()
    sortBy: GiftReceivedSortBy = 'receivedDate';

    @Type(() => Number)                              // ✅ from class-transformer
    @IsInt()
    @IsOptional()
    functionId?: number;
}
