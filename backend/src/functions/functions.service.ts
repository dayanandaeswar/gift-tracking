import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionEvent } from './function.entity';
import { CreateFunctionDto } from './dto/create-function.dto';
import { ListFunctionsDto, FunctionSortBy } from './dto/list-functions.dto';
import { paginate } from '../common/helpers/paginate.helper';

// Maps DTO sort keys to actual DB columns
const SORT_COLUMN: Record<FunctionSortBy, string> = {
    name: 'fn.name',
    eventDate: 'fn.event_date',
    createdAt: 'fn.created_at',
};

@Injectable()
export class FunctionsService {
    constructor(
        @InjectRepository(FunctionEvent)
        private readonly repo: Repository<FunctionEvent>,
    ) { }

    async list(dto: ListFunctionsDto) {
        const { page, pageSize, sortBy, sortDir } = dto;

        const qb = this.repo
            .createQueryBuilder('fn')
            // Count gifts per function without loading all gift data
            .loadRelationCountAndMap('fn.giftsCount', 'fn.giftsReceived')
            .orderBy(SORT_COLUMN[sortBy], sortDir.toUpperCase() as 'ASC' | 'DESC');

        return paginate(qb, page, pageSize, sortBy, sortDir);
    }

    async findOne(id: number) {
        const fn = await this.repo.findOne({
            where: { id },
            relations: ['giftsReceived', 'giftsReceived.person'],
        });
        if (!fn) throw new NotFoundException('Function not found');
        return fn;
    }

    async create(dto: CreateFunctionDto) {
        const fn = this.repo.create(dto);
        return this.repo.save(fn);
    }

    async update(id: number, dto: Partial<CreateFunctionDto>) {
        const fn = await this.findOne(id);
        Object.assign(fn, dto);
        return this.repo.save(fn);
    }

    async remove(id: number) {
        const fn = await this.findOne(id);
        return this.repo.remove(fn);
    }
}
