import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-modal-ver-informacion',
  templateUrl: './modal-ver-informacion.component.html',
  styleUrls: ['./modal-ver-informacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ModalVerInformacionComponent implements OnInit {

  documento: string;
  numeroDocumento: string;
  entidadEmisora: string;
  fechaEmision: string;
  folios: string;
  tipoFormato: string;
  sumilla: string;
  mostrarVisto: string;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public matDialogRef: MatDialogRef<ModalVerInformacionComponent>,
  ) { }

  ngOnInit(): void {
    var resolucion = this.data.data;

    this.documento = resolucion.tipoDocumentoSustento;
    this.numeroDocumento = resolucion.numeroDocumentoSustento;
    this.entidadEmisora = resolucion.entidadEmisora;
    this.fechaEmision = resolucion.fechaEmision;
    this.folios = resolucion.numeroFolios;
    this.tipoFormato = resolucion.tipoFormatoSustento;
    this.sumilla = resolucion.sumilla;
    this.mostrarVisto = resolucion.vistoProyecto ? "Si" : "No";
  }

}
