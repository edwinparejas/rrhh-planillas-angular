import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-atender-solicitud',
  templateUrl: './atender-solicitud.component.html',
  styleUrls: ['./atender-solicitud.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AtenderSolicitudComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
