import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionEvent } from './function.entity';
import { FunctionsService } from './functions.service';
import { FunctionsController } from './functions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([FunctionEvent])],
    providers: [FunctionsService],
    controllers: [FunctionsController],
    exports: [TypeOrmModule],
})
export class FunctionsModule { }
