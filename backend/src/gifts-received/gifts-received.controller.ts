import { Controller, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { GiftsReceivedService } from './gifts-received.service';
import { CreateGiftReceivedDto } from './dto/create-gift-received.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gifts-received')
export class GiftsReceivedController {
    constructor(private svc: GiftsReceivedService) { }

    @Post() create(@Body() dto: CreateGiftReceivedDto) { return this.svc.create(dto); }
    @Put(':id') update(@Param('id') id: number, @Body() dto: CreateGiftReceivedDto) { return this.svc.update(+id, dto); }
    @Delete(':id') remove(@Param('id') id: number) { return this.svc.remove(+id); }
}
