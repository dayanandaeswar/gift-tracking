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
        @InjectRepository(GiftReceived) private repo: Repository<GiftReceived>,
        @InjectRepository(FunctionEvent) private fnRepo: Repository<FunctionEvent>,
        @InjectRepository(Person) private personRepo: Repository<Person>,
    ) { }

    async create(dto: CreateGiftReceivedDto) {
        const fn = await this.fnRepo.findOne({ where: { id: dto.functionId } });
        if (!fn) throw new NotFoundException('Function not found');

        const person = await this.personRepo.findOne({ where: { id: dto.personId } });
        if (!person) throw new NotFoundException('Person not found');

        const gift = this.repo.create({ ...dto, function: fn, person });
        return this.repo.save(gift);
    }

    async update(id: number, dto: Partial<CreateGiftReceivedDto>) {
        await this.repo.update(id, dto);
        return this.repo.findOne({ where: { id }, relations: ['function', 'person'] });
    }

    async remove(id: number) {
        const g = await this.repo.findOne({ where: { id } });
        if (!g) throw new NotFoundException();
        return this.repo.remove(g);
    }
}
