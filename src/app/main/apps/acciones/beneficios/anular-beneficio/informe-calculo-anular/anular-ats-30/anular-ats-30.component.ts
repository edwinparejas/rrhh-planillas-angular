import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-anular-ats-30',
  templateUrl: './anular-ats-30.component.html',
  styleUrls: ['./anular-ats-30.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularAts30Component implements OnInit {
    @Input() form:FormGroup;
    constructor() { }

    ngOnInit() {
      this.loadImporteBeneficio();
    }
    loadImporteBeneficio(){
      
      }

}
