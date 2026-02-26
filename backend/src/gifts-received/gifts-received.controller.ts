import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GiftsReceivedService } from './gifts-received.service';
import { ListGiftsReceivedDto } from './dto/list-gifts-received.dto';
import { CreateGiftReceivedDto } from './dto/create-gift-received.dto';

@UseGuards(JwtAuthGuard)
@Controller('gifts-received')
export class GiftsReceivedController {
    constructor(private readonly svc: GiftsReceivedService) { }

    @Get()
    list(@Query() query: ListGiftsReceivedDto) {
        return this.svc.list(query);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.svc.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateGiftReceivedDto) {
        return this.svc.create(dto);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: Partial<CreateGiftReceivedDto>,
    ) {
        return this.svc.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.svc.remove(id);
    }
}
