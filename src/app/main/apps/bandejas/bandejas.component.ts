import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-bandejas',
  templateUrl: './bandejas.component.html',
  styleUrls: ['./bandejas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class BandejasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
