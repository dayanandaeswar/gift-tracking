import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionEvent } from './function.entity';
import { CreateFunctionDto } from './dto/create-function.dto';

@Injectable()
export class FunctionsService {
    constructor(
        @InjectRepository(FunctionEvent) private repo: Repository<FunctionEvent>,
    ) { }

    findAll() {
        return this.repo.find({
            relations: ['giftsReceived'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number) {
        const fn = await this.repo.findOne({
            where: { id },
            relations: ['giftsReceived', 'giftsReceived.person'],
        });
        if (!fn) throw new NotFoundException('Function not found');
        return fn;
    }

    create(dto: CreateFunctionDto) {
        return this.repo.save(this.repo.create(dto));
    }

    async update(id: number, dto: Partial<CreateFunctionDto>) {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: number) {
        const fn = await this.findOne(id);
        return this.repo.remove(fn);
    }
}
