import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-ubicacion',
    templateUrl: './ubicacion.component.html',
    styleUrls: ['./ubicacion.component.scss']
})
export class UbicacionComponent implements OnInit {
    @Input('parentForm')
    parentForm: FormGroup;
    constructor() { }

    ngOnInit(): void {
    }

}
