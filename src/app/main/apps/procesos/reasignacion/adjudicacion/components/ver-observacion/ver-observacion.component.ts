import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-ver-observacion',
  templateUrl: './ver-observacion.component.html',
  styleUrls: ['./ver-observacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class VerObservacionComponent implements OnInit {

  item: any = null;
  textoTitulo: string = 'Ver observación'
  textoSubTitulo: string = 'Detalle de la observación'
  textoObservacion: string = ''

  constructor(
    public matDialogRef: MatDialogRef<VerObservacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any

  ) { }

  ngOnInit(): void {
    this.item = this.data;
    if(this.item.tipo == 1){
        //Es observacion
        this.textoTitulo = 'Ver observación';
        this.textoSubTitulo = 'Detalle de la observación';
        this.textoObservacion = this.item.observacion;
    }else{
        if(this.item.tipo == 2){
            //Es Subsanacion
            this.textoTitulo = 'Ver subsanación';
            this.textoSubTitulo = 'Detalle de la subsanación';
            this.textoObservacion = this.item.observacion;
        }
    }
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };
}

