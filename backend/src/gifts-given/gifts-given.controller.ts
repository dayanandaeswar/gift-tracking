import { Controller, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { GiftsGivenService } from './gifts-given.service';
import { CreateGiftGivenDto } from './dto/create-gift-given.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gifts-given')
export class GiftsGivenController {
    constructor(private svc: GiftsGivenService) { }

    @Post() create(@Body() dto: CreateGiftGivenDto) { return this.svc.create(dto); }
    @Put(':id') update(@Param('id') id: number, @Body() dto: CreateGiftGivenDto) { return this.svc.update(+id, dto); }
    @Delete(':id') remove(@Param('id') id: number) { return this.svc.remove(+id); }
}
