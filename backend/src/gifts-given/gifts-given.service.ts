import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftGiven } from './gift-given.entity';
import { Person } from '../persons/person.entity';
import { CreateGiftGivenDto } from './dto/create-gift-given.dto';
import {
    ListGiftsGivenDto,
    GiftGivenSortBy,
} from './dto/list-gifts-given.dto';
import { paginate } from '../common/helpers/paginate.helper';

const SORT_COLUMN: Record<GiftGivenSortBy, string> = {
    functionName: 'gg.function_name',
    giftType: 'gg.gift_type',
    amount: 'gg.amount',
    givenDate: 'gg.given_date',
    createdAt: 'gg.created_at',
};

@Injectable()
export class GiftsGivenService {
    constructor(
        @InjectRepository(GiftGiven)
        private readonly repo: Repository<GiftGiven>,
        @InjectRepository(Person)
        private readonly personRepo: Repository<Person>,
    ) { }

    async list(dto: ListGiftsGivenDto) {
        const { page, pageSize, sortBy, sortDir, personId } = dto;

        const qb = this.repo
            .createQueryBuilder('gg')
            .leftJoinAndSelect('gg.person', 'person');

        if (personId) {
            qb.where('gg.person_id = :personId', { personId });
        }

        qb.orderBy(
            SORT_COLUMN[sortBy],
            sortDir.toUpperCase() as 'ASC' | 'DESC',
        );

        return paginate(qb, page, pageSize, sortBy, sortDir);
    }

    async findOne(id: number) {
        const gift = await this.repo.findOne({
            where: { id },
            relations: ['person'],
        });
        if (!gift) throw new NotFoundException('Gift not found');
        return gift;
    }

    async create(dto: CreateGiftGivenDto) {
        const person = await this.personRepo.findOne({
            where: { id: dto.personId },
        });
        if (!person) throw new NotFoundException('Person not found');

        const gift = this.repo.create({
            functionName: dto.functionName,
            giftType: dto.giftType,
            amount: dto.amount,
            voucherDetails: dto.voucherDetails,
            itemDescription: dto.itemDescription,
            quantity: dto.quantity ?? 1,
            notes: dto.notes,
            givenDate: dto.givenDate,
            person,
        });

        return this.repo.save(gift);
    }

    async update(id: number, dto: Partial<CreateGiftGivenDto>) {
        const gift = await this.repo.findOne({
            where: { id },
            relations: ['person'],
        });
        if (!gift) throw new NotFoundException('Gift not found');

        if (dto.personId) {
            const person = await this.personRepo.findOne({
                where: { id: dto.personId },
            });
            if (!person) throw new NotFoundException('Person not found');
            gift.person = person;
        }

        const { personId, ...fields } = dto;
        if (fields.functionName !== undefined) gift.functionName = fields.functionName;
        if (fields.giftType !== undefined) gift.giftType = fields.giftType;
        if (fields.amount !== undefined) gift.amount = fields.amount;
        if (fields.voucherDetails !== undefined) gift.voucherDetails = fields.voucherDetails;
        if (fields.itemDescription !== undefined) gift.itemDescription = fields.itemDescription;
        if (fields.quantity !== undefined) gift.quantity = fields.quantity;
        if (fields.notes !== undefined) gift.notes = fields.notes;
        if (fields.givenDate !== undefined) gift.givenDate = fields.givenDate;

        return this.repo.save(gift);
    }

    async remove(id: number) {
        const gift = await this.findOne(id);
        return this.repo.remove(gift);
    }
}
