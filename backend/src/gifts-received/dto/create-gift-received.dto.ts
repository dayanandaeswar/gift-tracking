import { IsEnum, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';
import { GiftType } from 'src/shared/enums/gift-type.enum';

export class CreateGiftReceivedDto {
    @IsNumber()
    functionId: number;

    @IsNumber()
    personId: number;

    @IsEnum(GiftType)
    giftType: GiftType;

    @IsOptional() @IsNumber()
    amount?: number;

    @IsOptional() @IsString()
    voucherDetails?: string;

    @IsOptional() @IsString()
    itemDescription?: string;

    @IsOptional() @IsNumber()
    quantity?: number;

    @IsOptional() @IsString()
    notes?: string;

    @IsOptional() @IsDateString()
    receivedDate?: string;
}
