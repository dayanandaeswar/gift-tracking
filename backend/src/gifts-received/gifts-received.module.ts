import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftReceived } from './gift-received.entity';
import { FunctionEvent } from '../functions/function.entity';
import { Person } from '../persons/person.entity';
import { GiftsReceivedService } from './gifts-received.service';
import { GiftsReceivedController } from './gifts-received.controller';

@Module({
    imports: [TypeOrmModule.forFeature([GiftReceived, FunctionEvent, Person])],
    providers: [GiftsReceivedService],
    controllers: [GiftsReceivedController],
})
export class GiftsReceivedModule { }
