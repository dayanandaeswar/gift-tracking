import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiftGiven } from './gift-given.entity';
import { Person } from '../persons/person.entity';
import { CreateGiftGivenDto } from './dto/create-gift-given.dto';

@Injectable()
export class GiftsGivenService {
    constructor(
        @InjectRepository(GiftGiven) private repo: Repository<GiftGiven>,
        @InjectRepository(Person) private personRepo: Repository<Person>,
    ) { }

    async create(dto: CreateGiftGivenDto) {
        const person = await this.personRepo.findOne({ where: { id: dto.personId } });
        if (!person) throw new NotFoundException('Person not found');
        const gift = this.repo.create({ ...dto, person });
        return this.repo.save(gift);
    }

    async update(id: number, dto: Partial<CreateGiftGivenDto>) {
        await this.repo.update(id, dto);
        return this.repo.findOne({ where: { id }, relations: ['person'] });
    }

    async remove(id: number) {
        const g = await this.repo.findOne({ where: { id } });
        if (!g) throw new NotFoundException();
        return this.repo.remove(g);
    }
}
