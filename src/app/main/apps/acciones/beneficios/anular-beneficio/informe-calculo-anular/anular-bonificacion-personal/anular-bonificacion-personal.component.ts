import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-anular-bonificacion-personal',
  templateUrl: './anular-bonificacion-personal.component.html',
  styleUrls: ['./anular-bonificacion-personal.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularBonificacionPersonalComponent implements OnInit {
    @Input() form:FormGroup;
  constructor() { }

  ngOnInit() {
    //console.log('quinquenio',this.form.get("quinquenio").value)
  }

}
