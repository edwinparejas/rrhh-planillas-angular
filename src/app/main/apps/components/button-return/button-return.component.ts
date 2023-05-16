import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-button-return',
  templateUrl: './button-return.component.html',
  styleUrls: ['./button-return.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ButtonReturnComponent implements OnInit {

  @Output()
  mineduOnReturn: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  onClickChild(event) {
    if (this.mineduOnReturn) {
      this.mineduOnReturn.next(event);
    }
  }
}