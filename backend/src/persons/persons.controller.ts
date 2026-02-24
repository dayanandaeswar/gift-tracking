import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('persons')
export class PersonsController {
    constructor(private svc: PersonsService) { }

    @Get() findAll() { return this.svc.findAll(); }
    @Get(':id') findOne(@Param('id') id: number) { return this.svc.findOne(+id); }
    @Post() create(@Body() dto: CreatePersonDto) { return this.svc.create(dto); }
    @Put(':id') update(@Param('id') id: number, @Body() dto: CreatePersonDto) { return this.svc.update(+id, dto); }
    @Delete(':id') remove(@Param('id') id: number) { return this.svc.remove(+id); }
}
