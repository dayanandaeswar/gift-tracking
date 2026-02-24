import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftGiven } from './gift-given.entity';
import { Person } from '../persons/person.entity';
import { GiftsGivenService } from './gifts-given.service';
import { GiftsGivenController } from './gifts-given.controller';

@Module({
    imports: [TypeOrmModule.forFeature([GiftGiven, Person])],
    providers: [GiftsGivenService],
    controllers: [GiftsGivenController],
})
export class GiftsGivenModule { }
