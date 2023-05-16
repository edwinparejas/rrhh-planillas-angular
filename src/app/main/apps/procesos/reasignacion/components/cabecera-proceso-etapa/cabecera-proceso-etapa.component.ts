import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'minedu-cabecera-proceso-etapa',
  templateUrl: './cabecera-proceso-etapa.component.html',
  styleUrls: ['./cabecera-proceso-etapa.component.scss']
})
export class CabeceraProcesoEtapaComponent implements OnInit {

  @Input() proceso: any = null;
    
  constructor() { }

  ngOnInit(): void {
  }

}
