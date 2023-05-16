import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'app-anular-premio-anual',
  templateUrl: './anular-premio-anual.component.html',
  styleUrls: ['./anular-premio-anual.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AnularPremioAnualComponent implements OnInit {
    @Input() form:FormGroup;
  constructor() { }

  ngOnInit() {
  }

}
