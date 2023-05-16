import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-retornar',
    templateUrl: './retornar.component.html',
    styleUrls: ['./retornar.component.scss']
})
export class RetornarComponent implements OnInit {

    @Input('parentForm')
    parentForm: FormGroup;
    constructor() { }

    ngOnInit(): void {
    }

}
