import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'minedu-button-send',
  templateUrl: './button-send.component.html',
  styleUrls: ['./button-send.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ButtonSendComponent implements OnInit {

  @Input()
  mineduForm: FormGroup;

  @Input()
  working = false;

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