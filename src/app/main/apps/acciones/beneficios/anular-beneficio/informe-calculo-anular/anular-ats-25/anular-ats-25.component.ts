import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';
@Component({
  selector: 'minedu-anular-ats-25',
  templateUrl: './anular-ats-25.component.html',
  styleUrls: ['./anular-ats-25.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularAts25Component implements OnInit {

    @Input() form:FormGroup;
  constructor() { }

  ngOnInit() {
    this.loadImporteBeneficio();
  }
  loadImporteBeneficio(){
    
    }
}
