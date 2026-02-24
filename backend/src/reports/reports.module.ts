import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionEvent } from '../functions/function.entity';
import { Person } from '../persons/person.entity';
import { GiftReceived } from '../gifts-received/gift-received.entity';
import { GiftGiven } from '../gifts-given/gift-given.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
    imports: [TypeOrmModule.forFeature([FunctionEvent, Person, GiftReceived, GiftGiven])],
    providers: [ReportsService],
    controllers: [ReportsController],
})
export class ReportsModule { }
