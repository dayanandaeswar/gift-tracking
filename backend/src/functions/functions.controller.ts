import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { FunctionsService } from './functions.service';
import { CreateFunctionDto } from './dto/create-function.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('functions')
export class FunctionsController {
    constructor(private svc: FunctionsService) { }

    @Get() findAll() { return this.svc.findAll(); }
    @Get(':id') findOne(@Param('id') id: number) { return this.svc.findOne(+id); }
    @Post() create(@Body() dto: CreateFunctionDto) { return this.svc.create(dto); }
    @Put(':id') update(@Param('id') id: number, @Body() dto: CreateFunctionDto) { return this.svc.update(+id, dto); }
    @Delete(':id') remove(@Param('id') id: number) { return this.svc.remove(+id); }
}
