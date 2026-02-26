import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GiftsGivenService } from './gifts-given.service';
import { ListGiftsGivenDto } from './dto/list-gifts-given.dto';
import { CreateGiftGivenDto } from './dto/create-gift-given.dto';

@UseGuards(JwtAuthGuard)
@Controller('gifts-given')
export class GiftsGivenController {
    constructor(private readonly svc: GiftsGivenService) { }

    @Get()
    list(@Query() query: ListGiftsGivenDto) {
        return this.svc.list(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.svc.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateGiftGivenDto) {
        return this.svc.create(dto);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: Partial<CreateGiftGivenDto>,
    ) {
        return this.svc.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.svc.remove(id);
    }
}
