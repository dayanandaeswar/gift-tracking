import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftReceived } from './gift-received.entity';
import { FunctionEvent } from '../functions/function.entity';
import { Person } from '../persons/person.entity';
import { CreateGiftReceivedDto } from './dto/create-gift-received.dto';

@Injectable()
export class GiftsReceivedService {
    constructor(
        @InjectRepository(GiftReceived)
        private repo: Repository<GiftReceived>,
        @InjectRepository(FunctionEvent)
        private fnRepo: Repository<FunctionEvent>,
        @InjectRepository(Person)
        private personRepo: Repository<Person>,
    ) { }

    // ── Create ─────────────────────────────────────────────────────────
    async create(dto: CreateGiftReceivedDto) {
        const fn = await this.fnRepo.findOne({ where: { id: dto.functionId } });
        if (!fn) throw new NotFoundException('Function not found');

        const person = await this.personRepo.findOne({ where: { id: dto.personId } });
        if (!person) throw new NotFoundException('Person not found');

        const gift = this.repo.create({
            giftType: dto.giftType,
            amount: dto.amount,
            voucherDetails: dto.voucherDetails,
            itemDescription: dto.itemDescription,
            quantity: dto.quantity ?? 1,
            notes: dto.notes,
            receivedDate: dto.receivedDate,
            function: fn,      // ← assign relation object, not ID
            person,                   // ← assign relation object, not ID
        });

        return this.repo.save(gift);
    }

    // ── Update ─────────────────────────────────────────────────────────
    async update(id: number, dto: Partial<CreateGiftReceivedDto>) {
        // Load existing gift with relations
        const gift = await this.repo.findOne({
            where: { id },
            relations: ['function', 'person'],
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

        // Update function relation if functionId provided
        if (dto.functionId) {
            const fn = await this.fnRepo.findOne({
                where: { id: dto.functionId },
            });
            if (!fn) throw new NotFoundException('Function not found');
            gift.function = fn;       // ← assign relation object
        }

        // Update all scalar fields — exclude relation IDs
        const { personId, functionId, ...scalarFields } = dto;

        if (scalarFields.giftType !== undefined) gift.giftType = scalarFields.giftType;
        if (scalarFields.amount !== undefined) gift.amount = scalarFields.amount;
        if (scalarFields.voucherDetails !== undefined) gift.voucherDetails = scalarFields.voucherDetails;
        if (scalarFields.itemDescription !== undefined) gift.itemDescription = scalarFields.itemDescription;
        if (scalarFields.quantity !== undefined) gift.quantity = scalarFields.quantity;
        if (scalarFields.notes !== undefined) gift.notes = scalarFields.notes;
        if (scalarFields.receivedDate !== undefined) gift.receivedDate = scalarFields.receivedDate;

        return this.repo.save(gift);  // ← save() handles relations correctly
    }

    // ── Delete ─────────────────────────────────────────────────────────
    async remove(id: number) {
        const gift = await this.repo.findOne({ where: { id } });
        if (!gift) throw new NotFoundException('Gift not found');
        return this.repo.remove(gift);
    }
}
