import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-destaque',
    templateUrl: './destaque.component.html',
    styleUrls: ['./destaque.component.scss']
})
export class DestaqueComponent implements OnInit {

    @Input('parentForm')
    parentForm: FormGroup;

    constructor() { }

    ngOnInit(): void {
    }

}
