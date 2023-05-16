import { FormControl } from '@angular/forms';
import { Directive, HostBinding, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[mineduFormRequiredLabel]'
})
export class FormRequiredLabelDirective implements OnInit {

  @Input()
  mineduFormRequiredLabel: FormControl;

  @HostBinding('class.required-minedu')
  isRequired: boolean;

  constructor() { }

  ngOnInit() {
      const validator: any = this.mineduFormRequiredLabel.validator && this.mineduFormRequiredLabel.validator(new FormControl());
      this.isRequired = validator && validator.required;
  }

}
