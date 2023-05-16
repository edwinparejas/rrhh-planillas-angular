import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-anular-cts-29944',
  templateUrl: './anular-cts-29944.component.html',
  styleUrls: ['./anular-cts-29944.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class Anularcts29944Component implements OnInit {
    @Input() form:FormGroup;
  constructor() { }

  ngOnInit() {
  }

}
