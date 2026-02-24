import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(private svc: ReportsService) { }

    @Get('function/:id') functionReport(@Param('id') id: number) { return this.svc.getFunctionReport(+id); }
    @Get('person/:id') personReport(@Param('id') id: number) { return this.svc.getPersonReport(+id); }
    @Get('persons') allPersons() { return this.svc.getAllPersons(); }
}
