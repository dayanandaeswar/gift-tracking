import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftGiven } from './gift-given.entity';
import { Person } from '../persons/person.entity';
import { CreateGiftGivenDto } from './dto/create-gift-given.dto';

@Injectable()
export class GiftsGivenService {
    constructor(
        @InjectRepository(GiftGiven)
        private repo: Repository<GiftGiven>,
        @InjectRepository(Person)
        private personRepo: Repository<Person>,
    ) { }

    async create(dto: CreateGiftGivenDto) {
        const person = await this.personRepo.findOne({ where: { id: dto.personId } });
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
            person,           // ← relation object
        });

        return this.repo.save(gift);
    }

    async update(id: number, dto: Partial<CreateGiftGivenDto>) {
        const gift = await this.repo.findOne({
            where: { id },
            relations: ['person'],
        });
        if (!gift) throw new NotFoundException('Gift not found');

        // Update person relation if personId provided
        if (dto.personId) {
            const person = await this.personRepo.findOne({
                where: { id: dto.personId },
            });
            if (!person) throw new NotFoundException('Person not found');
            gift.person = person;     // ← assign relation object
        }

        // Update scalar fields only
        const { personId, ...scalarFields } = dto;

        if (scalarFields.functionName !== undefined) gift.functionName = scalarFields.functionName;
        if (scalarFields.giftType !== undefined) gift.giftType = scalarFields.giftType;
        if (scalarFields.amount !== undefined) gift.amount = scalarFields.amount;
        if (scalarFields.voucherDetails !== undefined) gift.voucherDetails = scalarFields.voucherDetails;
        if (scalarFields.itemDescription !== undefined) gift.itemDescription = scalarFields.itemDescription;
        if (scalarFields.quantity !== undefined) gift.quantity = scalarFields.quantity;
        if (scalarFields.notes !== undefined) gift.notes = scalarFields.notes;
        if (scalarFields.givenDate !== undefined) gift.givenDate = scalarFields.givenDate;

        return this.repo.save(gift);
    }

    async remove(id: number) {
        const gift = await this.repo.findOne({ where: { id } });
        if (!gift) throw new NotFoundException('Gift not found');
        return this.repo.remove(gift);
    }
}
