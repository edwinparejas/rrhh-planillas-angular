import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-contenedor-bandeja',
  templateUrl: './contenedor-bandeja.component.html',
  styleUrls: ['./contenedor-bandeja.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ContenedorBandejaComponent implements OnInit {
    
    @Input() idEtapaProceso: string;
    @Input() routerLinks:any;
    @Input() tituloBandeja: string;
    

  constructor() { }

  ngOnInit(): void {
  }

}
