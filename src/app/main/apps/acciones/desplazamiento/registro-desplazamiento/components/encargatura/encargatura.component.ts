import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'minedu-encargatura',
    templateUrl: './encargatura.component.html',
    styleUrls: ['./encargatura.component.scss']
})
export class EncargaturaComponent implements OnInit {

    @Input('parentForm')
    parentForm: FormGroup;
    
    constructor() { }

    ngOnInit(): void {
    }

}
