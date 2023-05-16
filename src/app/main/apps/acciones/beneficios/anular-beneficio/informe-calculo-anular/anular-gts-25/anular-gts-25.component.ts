import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-anular-gts-25',
  templateUrl: './anular-gts-25.component.html',
  styleUrls: ['./anular-gts-25.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularGts25Component implements OnInit {
    @Input() form:FormGroup;
  constructor() { }

  ngOnInit() {
  }

}
