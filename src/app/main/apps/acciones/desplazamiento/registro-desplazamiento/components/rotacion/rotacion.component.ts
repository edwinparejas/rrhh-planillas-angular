import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-rotacion',
    templateUrl: './rotacion.component.html',
    styleUrls: ['./rotacion.component.scss']
})
export class RotacionComponent implements OnInit {
    @Input('parentForm')
    parentForm: FormGroup;
    constructor() { }

    ngOnInit(): void {
    }

}
