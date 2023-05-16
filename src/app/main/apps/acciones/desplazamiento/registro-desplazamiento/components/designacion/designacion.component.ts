import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-designacion',
    templateUrl: './designacion.component.html',
    styleUrls: ['./designacion.component.scss']
})
export class DesignacionComponent implements OnInit {
    @Input('parentForm')
    parentForm: FormGroup;

    constructor() { }

    ngOnInit(): void {
    }

}
