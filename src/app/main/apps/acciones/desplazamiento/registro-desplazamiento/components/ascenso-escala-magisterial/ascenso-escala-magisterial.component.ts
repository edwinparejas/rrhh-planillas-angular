import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-ascenso-escala-magisterial',
    templateUrl: './ascenso-escala-magisterial.component.html',
    styleUrls: ['./ascenso-escala-magisterial.component.scss']
})
export class AscensoEscalaMagisterialComponent implements OnInit {

    @Input('parentForm')
    parentForm: FormGroup;
    constructor() { }

    ngOnInit(): void {
    }

}
