import { Directive, HostBinding, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Directive({
  selector: '[mineduFormFieldValidationState]'
})
export class FormFieldValidationStateDirective implements OnInit {

  @Input()
  mineduFormFieldValidationState: FormControl;

  @HostBinding('class.has-error')
  hasError: boolean;

  constructor() { }

  ngOnInit() {
      this.mineduFormFieldValidationState.statusChanges.subscribe(controlValue => {
          if (this.mineduFormFieldValidationState.valid || this.mineduFormFieldValidationState.disabled) {
              this.hasError = false;
          } else {
              this.hasError = true;
          }
      });
  }

}
