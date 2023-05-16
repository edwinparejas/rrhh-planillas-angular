import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-ascenso-cargo',
    templateUrl: './ascenso-cargo.component.html',
    styleUrls: ['./ascenso-cargo.component.scss']
})
export class AscensoCargoComponent implements OnInit {
    @Input('parentForm')
    parentForm: FormGroup;
    constructor() { }

    ngOnInit(): void {
    }

}
