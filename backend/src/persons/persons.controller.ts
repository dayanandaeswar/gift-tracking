import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonsService } from './persons.service';
import { ListPersonsDto } from './dto/list-persons.dto';
import { CreatePersonDto } from './dto/create-person.dto';

@UseGuards(JwtAuthGuard)
@Controller('persons')
export class PersonsController {
    constructor(private readonly svc: PersonsService) { }

    @Get()
    list(@Query() query: ListPersonsDto) {
        return this.svc.list(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.svc.findOne(id);
    }

    @Post()
    create(@Body() dto: CreatePersonDto) {
        return this.svc.create(dto);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: Partial<CreatePersonDto>,
    ) {
        return this.svc.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.svc.remove(id);
    }
}
