import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-button-update',
  templateUrl: './button-update.component.html',
  styleUrls: ['./button-update.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ButtonUpdateComponent implements OnInit {

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
