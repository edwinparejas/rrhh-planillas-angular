import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-contenedor-prepub',
  templateUrl: './contenedor-prepub.component.html',
  styleUrls: ['./contenedor-prepub.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ContenedorPrepubComponent implements OnInit {
 @Input() idEtapaProceso: string;
 @Input() routerLinks:any;
 
  constructor() { }

  ngOnInit(): void {
  }
}
