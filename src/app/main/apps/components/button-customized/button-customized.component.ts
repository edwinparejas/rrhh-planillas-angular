import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'minedu-button-customized',
  templateUrl: './button-customized.component.html',
  styleUrls: ['./button-customized.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ButtonCustomizedComponent implements OnInit {

  @Input()
  mineduForm: FormGroup;

  @Input()
  styleraised = true;

  @Input()
  working = false;

  @Input()
  text = '';

  @Input()
  textWorking = 'Trabajando';

  @Input()
  icon = '';

  @Output()
  mineduOnClick: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  onClickChild(event) {
    if (!this.mineduForm.valid) {
      event.preventDefault();
    }
    if (this.mineduOnClick) {
      this.mineduOnClick.next(event);
    }
  }
}