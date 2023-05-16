import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-cabecera-proceso-etapa',
  templateUrl: './cabecera-proceso-etapa.component.html',
  styleUrls: ['./cabecera-proceso-etapa.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class CabeceraProcesoEtapaComponent implements OnInit {

  @Input()
  proceso: any = null;

  constructor() { }

  ngOnInit(): void {
  }

}
