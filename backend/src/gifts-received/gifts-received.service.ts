import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftReceived } from './gift-received.entity';
import { FunctionEvent } from '../functions/function.entity';
import { Person } from '../persons/person.entity';
import { CreateGiftReceivedDto } from './dto/create-gift-received.dto';
import {
    ListGiftsReceivedDto,
    GiftReceivedSortBy,
} from './dto/list-gifts-received.dto';
import { paginate } from '../common/helpers/paginate.helper';

const SORT_COLUMN: Record<GiftReceivedSortBy, string> = {
    person: 'person.name',
    giftType: 'gr.gift_type',
    amount: 'gr.amount',
    receivedDate: 'gr.received_date',
    createdAt: 'gr.created_at',
};

@Injectable()
export class GiftsReceivedService {
    constructor(
        @InjectRepository(GiftReceived)
        private readonly repo: Repository<GiftReceived>,
        @InjectRepository(FunctionEvent)
        private readonly fnRepo: Repository<FunctionEvent>,
        @InjectRepository(Person)
        private readonly personRepo: Repository<Person>,
    ) { }

    async list(dto: ListGiftsReceivedDto) {
        const { page, pageSize, sortBy, sortDir, functionId } = dto;

        const qb = this.repo
            .createQueryBuilder('gr')
            .leftJoinAndSelect('gr.person', 'person')
            .leftJoinAndSelect('gr.function', 'function');

        // Optional filter by function
        if (functionId) {
            qb.where('gr.function_id = :functionId', { functionId });
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
            relations: ['person', 'function'],
        });
        if (!gift) throw new NotFoundException('Gift not found');
        return gift;
    }

    async create(dto: CreateGiftReceivedDto) {
        const fn = await this.fnRepo.findOne({
            where: { id: dto.functionId },
        });
        if (!fn) throw new NotFoundException('Function not found');

        const person = await this.personRepo.findOne({
            where: { id: dto.personId },
        });
        if (!person) throw new NotFoundException('Person not found');

        const gift = this.repo.create({
            giftType: dto.giftType,
            amount: dto.amount,
            voucherDetails: dto.voucherDetails,
            itemDescription: dto.itemDescription,
            quantity: dto.quantity ?? 1,
            notes: dto.notes,
            receivedDate: dto.receivedDate,
            function: fn,
            person,
        });

        return this.repo.save(gift);
    }

    async update(id: number, dto: Partial<CreateGiftReceivedDto>) {
        const gift = await this.repo.findOne({
            where: { id },
            relations: ['person', 'function'],
        });
        if (!gift) throw new NotFoundException('Gift not found');

        if (dto.personId) {
            const person = await this.personRepo.findOne({
                where: { id: dto.personId },
            });
            if (!person) throw new NotFoundException('Person not found');
            gift.person = person;
        }

        if (dto.functionId) {
            const fn = await this.fnRepo.findOne({
                where: { id: dto.functionId },
            });
            if (!fn) throw new NotFoundException('Function not found');
            gift.function = fn;
        }

        const { personId, functionId, ...fields } = dto;
        if (fields.giftType !== undefined) gift.giftType = fields.giftType;
        if (fields.amount !== undefined) gift.amount = fields.amount;
        if (fields.voucherDetails !== undefined) gift.voucherDetails = fields.voucherDetails;
        if (fields.itemDescription !== undefined) gift.itemDescription = fields.itemDescription;
        if (fields.quantity !== undefined) gift.quantity = fields.quantity;
        if (fields.notes !== undefined) gift.notes = fields.notes;
        if (fields.receivedDate !== undefined) gift.receivedDate = fields.receivedDate;

        return this.repo.save(gift);
    }

    async remove(id: number) {
        const gift = await this.findOne(id);
        return this.repo.remove(gift);
    }
}
