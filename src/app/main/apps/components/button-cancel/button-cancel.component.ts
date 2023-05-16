import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-button-cancel',
  templateUrl: './button-cancel.component.html',
  styleUrls: ['./button-cancel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ButtonCancelComponent implements OnInit {

  @Output()
  mineduOnCancel: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  cancel() {
    this.mineduOnCancel.emit(true);
  }

}
