import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
    selector: 'minedu-from-control',
    templateUrl: './from-control.component.html',
    styleUrls: ['./from-control.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class FromControlComponent implements OnInit {
    @Input() variant:
        | 'text'
        | 'check'
        | 'multiline'
        | 'select'
        | 'multiselect'
        | 'datepicker' = 'text';
    @Input() class: string | object;
    @Input() label: string;
    @Input() placeholder: string = '';
    @Input() formGroupParent: FormGroup;
    @Input() controlName: string;
    @Input() msgValidations: any[] = [];
    @Input() rows: number;
    @Input() options: any[] = [];
    @Input() bindLabel: string = 'label';
    @Input() bindValue: string = 'value';
    @Input() bindObject: boolean = false;
    @Input() fullWidth: boolean = true;
    @Input() disabled: boolean = false;
    @Input() maxItems: number = 5;
    @Input() maxDate: any = null;
    @Input() minDate: any = moment('1900-01-01');
    @Input() readonly: boolean = false;
    @Input() appendToBody: boolean = true;
    @Input() maxSelectedLabels: number = 4;
    @Input() inputProps: any = { type: 'text' };
    @Input() showCharCount: boolean = false;
    //@Output('on-change') onChangeEvent: EventEmitter<any> = new EventEmitter();

    @Input() isRequired: boolean = false;
    errorToLoad: boolean = false;
    isSearchingOnSelect: boolean = false;
    isRequiredFalse: boolean;

    VARIANT_TYPE = {
        text: 'text',
        text2: 'text2',
        multiline: 'multiline',
        select: 'select',
        multiselect: 'multiselect',
        datepicker: 'datepicker',
        check: 'check',
    };
    constructor() { }

    ngOnInit(): void {
        if (this.disabled) {
            this.formGroupParent?.controls[this.controlName]?.disable();
        }

    }

}
