import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-permuta',
    templateUrl: './permuta.component.html',
    styleUrls: ['./permuta.component.scss']
})
export class PermutaComponent implements OnInit {

    @Input('parentForm')
    parentForm: FormGroup;
    constructor() { }

    ngOnInit(): void {
    }

}
