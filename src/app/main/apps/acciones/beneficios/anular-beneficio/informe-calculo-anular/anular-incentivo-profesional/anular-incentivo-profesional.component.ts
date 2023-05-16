import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-anular-incentivo-profesional',
  templateUrl: './anular-incentivo-profesional.component.html',
  styleUrls: ['./anular-incentivo-profesional.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularIncentivoProfesionalComponent implements OnInit {
    @Input() form:FormGroup;
  constructor() { }

  ngOnInit() {
  }

}
