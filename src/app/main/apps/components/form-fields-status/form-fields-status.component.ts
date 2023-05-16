import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';


@Component({
    selector: 'minedu-form-fields-status',
    templateUrl: './form-fields-status.component.html',
    styleUrls: ['./form-fields-status.component.scss']
})
export class FormFieldsStatusComponent implements OnInit {

    @Input()
    mineduForm: FormGroup;

    hasRequiredFields: boolean;

    constructor() { }

    ngOnInit() {
        this.refreshState();
    }

    refreshState() {
        this.hasRequiredFields = this.checkIfHasRequiredFields(this.mineduForm);
    }

    checkIfHasRequiredFields(formGroup: FormGroup): boolean {
        let result = false;
        for (const key in this.mineduForm.controls) {
            if (!this.mineduForm.controls[key]) { continue; }

            const abstractControl: AbstractControl = this.mineduForm.controls[key];
            if (abstractControl instanceof FormGroup) {
                if (this.checkIfHasRequiredFields(abstractControl)) {
                    result = true;
                    break;
                }
            } else {
                const validator: any = abstractControl.validator && abstractControl.validator(new FormControl());
                if (validator && validator.required) {
                    result = true;
                    break;
                }
            }
        }
        return result;
    }

}
