import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-button-exportar',
  templateUrl: './button-exportar.component.html',
  styleUrls: ['./button-exportar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  //animations: mineduAnimations
})
export class ButtonExportarComponent implements OnInit {

  // @Input()
  // mineduForm: FormGroup;

  @Input()
  exporting = false;

  @Output()
  mineduOnExport: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  onClickChild(event) {
    // if (!this.mineduForm.valid) {
    //   event.preventDefault();
    // }
    if (this.mineduOnExport) {
      this.mineduOnExport.next(event);
    }
  }
}