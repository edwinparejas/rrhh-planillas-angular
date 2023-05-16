import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'noRegistrado' })
export class NoRegistradoPipe implements PipeTransform {
    transform(value: number | string): any {
        if (value == null || value == 0 || `${value}`.length == 0) {
            return 'NO REGISTRADO';
        }
        return value;
    }
}