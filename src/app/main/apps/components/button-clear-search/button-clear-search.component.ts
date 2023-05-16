import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-button-clear-search',
  templateUrl: './button-clear-search.component.html',
  styleUrls: ['./button-clear-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ButtonClearSearchComponent implements OnInit {

  @Input()
  working = false;

  @Output()
  mineduOnClear: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  onClickChild(event) {
    if (this.mineduOnClear) {
      this.mineduOnClear.next(event);
    }
  }
}
