import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-button-save',
  templateUrl: './button-save.component.html',
  styleUrls: ['./button-save.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ButtonSaveComponent implements OnInit {

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
