import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-reasignacion',
    templateUrl: './reasignacion.component.html',
    styleUrls: ['./reasignacion.component.scss']
})
export class ReasignacionComponent implements OnInit {

    @Input('parentForm')
    parentForm: FormGroup;

    constructor() { }

    ngOnInit(): void {
    }

}
