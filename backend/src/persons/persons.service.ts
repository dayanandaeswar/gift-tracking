import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { CreatePersonDto } from './dto/create-person.dto';

@Injectable()
export class PersonsService {
    constructor(@InjectRepository(Person) private repo: Repository<Person>) { }

    findAll() {
        return this.repo.find({ order: { name: 'ASC' } });
    }

    async findOne(id: number) {
        const p = await this.repo.findOne({
            where: { id },
            relations: ['giftsReceived', 'giftsReceived.function', 'giftsGiven'],
        });
        if (!p) throw new NotFoundException('Person not found');
        return p;
    }

    create(dto: CreatePersonDto) {
        return this.repo.save(this.repo.create(dto));
    }

    async update(id: number, dto: Partial<CreatePersonDto>) {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const p = await this.findOne(id);
        return this.repo.remove(p);
    }
}
