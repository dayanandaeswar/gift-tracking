import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FunctionEvent } from '../functions/function.entity';
import { Person } from '../persons/person.entity';
import { GiftReceived } from '../gifts-received/gift-received.entity';
import { GiftGiven } from '../gifts-given/gift-given.entity';
import { GiftType } from 'src/shared/enums/gift-type.enum';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(FunctionEvent) private fnRepo: Repository<FunctionEvent>,
        @InjectRepository(Person) private personRepo: Repository<Person>,
        @InjectRepository(GiftReceived) private grRepo: Repository<GiftReceived>,
        @InjectRepository(GiftGiven) private ggRepo: Repository<GiftGiven>,
    ) { }

    async getFunctionReport(id: number) {
        const fn = await this.fnRepo.findOne({
            where: { id },
            relations: ['giftsReceived', 'giftsReceived.person'],
        });
        const gifts = fn!.giftsReceived;
        return {
            function: fn,
            giftsReceived: gifts,
            summary: {
                totalCount: gifts.length,
                totalCash: gifts
                    .filter((g) => g.giftType === GiftType.CASH)
                    .reduce((s, g) => s + Number(g.amount ?? 0), 0),
                totalVouchers: gifts.filter((g) => g.giftType === GiftType.VOUCHER).length,
                totalItems: gifts.filter((g) => g.giftType === GiftType.ITEM).length,
            },
        };
    }

    async getPersonReport(id: number) {
        const person = await this.personRepo.findOne({ where: { id } });
        const received = await this.grRepo.find({
            where: { person: { id } },
            relations: ['function'],
            order: { receivedDate: 'DESC' },
        });
        const given = await this.ggRepo.find({
            where: { person: { id } },
            order: { givenDate: 'DESC' },
        });
        return {
            person,
            giftsReceived: received,
            giftsGiven: given,
            summary: {
                totalReceived: received.length,
                totalGiven: given.length,
                totalCashReceived: received
                    .filter((g) => g.giftType === GiftType.CASH)
                    .reduce((s, g) => s + Number(g.amount ?? 0), 0),
                totalCashGiven: given
                    .filter((g) => g.giftType === GiftType.CASH)
                    .reduce((s, g) => s + Number(g.amount ?? 0), 0),
            },
        };
    }

    async getAllPersons() {
        const persons = await this.personRepo.find({ order: { name: 'ASC' } });
        return Promise.all(persons.map((p) => this.getPersonReport(p.id)));
    }
}
