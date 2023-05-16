import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'minedu-form-field-validation-messages',
  templateUrl: './form-field-validation-messages.component.html',
  styleUrls: ['./form-field-validation-messages.component.scss']
})
export class FormFieldValidationMessagesComponent implements OnInit {

  @Input()
  mineduFormControl: FormControl;

  constructor() { }

  ngOnInit() {
  }

}
