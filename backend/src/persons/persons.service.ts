import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { ListPersonsDto, PersonSortBy } from './dto/list-persons.dto';
import { paginate } from '../common/helpers/paginate.helper';

const SORT_COLUMN: Record<PersonSortBy, string> = {
    name: 'p.name',
    phone: 'p.phone',
    createdAt: 'p.created_at',
};

@Injectable()
export class PersonsService {
    constructor(
        @InjectRepository(Person)
        private readonly repo: Repository<Person>,
    ) { }

    async list(dto: ListPersonsDto) {
        const { page, pageSize, sortBy, sortDir } = dto;

        const qb = this.repo
            .createQueryBuilder('p')
            .orderBy(SORT_COLUMN[sortBy], sortDir.toUpperCase() as 'ASC' | 'DESC');

        return paginate(qb, page, pageSize, sortBy, sortDir);
    }

    async findOne(id: number) {
        const person = await this.repo.findOne({ where: { id } });
        if (!person) throw new NotFoundException('Person not found');
        return person;
    }

    async create(dto: CreatePersonDto) {
        const person = this.repo.create(dto);
        return this.repo.save(person);
    }

    async update(id: number, dto: Partial<CreatePersonDto>) {
        const person = await this.findOne(id);
        Object.assign(person, dto);
        return this.repo.save(person);
    }

    async remove(id: number) {
        const person = await this.findOne(id);
        return this.repo.remove(person);
    }
}
