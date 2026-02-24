import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'localDate',
    standalone: true,
})
export class LocalDatePipe implements PipeTransform {
    private datePipe = new DatePipe('en-IN');

    transform(value: string | null | undefined, format = 'dd MMM yyyy'): string {
        if (!value) return '';
        // Append T00:00:00 to treat date string as LOCAL time, not UTC
        const localDate = value.includes('T') ? value : `${value}T00:00:00`;
        return this.datePipe.transform(localDate, format) ?? '';
    }
}
