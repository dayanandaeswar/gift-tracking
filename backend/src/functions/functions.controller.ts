import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FunctionsService } from './functions.service';
import { ListFunctionsDto } from './dto/list-functions.dto';
import { CreateFunctionDto } from './dto/create-function.dto';

@UseGuards(JwtAuthGuard)
@Controller('functions')
export class FunctionsController {
    constructor(private readonly svc: FunctionsService) { }

    @Get()
    list(@Query() query: ListFunctionsDto) {
        return this.svc.list(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.svc.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateFunctionDto) {
        return this.svc.create(dto);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: Partial<CreateFunctionDto>,
    ) {
        return this.svc.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.svc.remove(id);
    }
}
