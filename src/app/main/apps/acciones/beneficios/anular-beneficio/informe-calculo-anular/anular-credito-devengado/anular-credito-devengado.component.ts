import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-anular-credito-devengado',
  templateUrl: './anular-credito-devengado.component.html',
  styleUrls: ['./anular-credito-devengado.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularCreditoDevengadoComponent implements OnInit {
@Input() form:FormGroup;
  constructor() { }

  ngOnInit() {
  }

}
