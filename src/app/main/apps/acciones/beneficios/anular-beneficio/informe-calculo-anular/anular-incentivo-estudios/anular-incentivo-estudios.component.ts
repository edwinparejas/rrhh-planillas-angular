import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-anular-incentivo-estudios',
  templateUrl: './anular-incentivo-estudios.component.html',
  styleUrls: ['./anular-incentivo-estudios.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularIncentivoEstudiosComponent implements OnInit {
    @Input() form:FormGroup;
  constructor() { }

  ngOnInit() {
  }

}
