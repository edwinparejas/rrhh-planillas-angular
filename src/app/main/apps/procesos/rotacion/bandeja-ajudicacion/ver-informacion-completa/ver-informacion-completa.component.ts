import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { isArray } from 'lodash';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-ver-informacion-completa',
  templateUrl: './ver-informacion-completa.component.html',
  styleUrls: ['./ver-informacion-completa.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class VerInformacionCompletaComponent implements OnInit {

  item: any = null;
  spublico = null;
  postulacion = null;
  informacionServidorPublico = null;
  dialogRef: any;

  constructor(
    public matDialogRef: MatDialogRef<VerInformacionCompletaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private materialDialog: MatDialog,
    private formBuilder: FormBuilder,
    private dataService: DataService,

  ) { }

  ngOnInit(): void {
    this.item = this.data;
    setTimeout((_) => {
      this.GetPostulacion();
    });

  }

  private GetPostulacion = () => {
    const { idPostulacion, idEtapaProceso } = this.data;
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Rotacion()
      .getInformacionPostulante({ idPostulacion: idPostulacion, idEtapaProceso: idEtapaProceso })
      .pipe(
        catchError((e) => { return this.configCatch(e); }),
        finalize(() => { this.dataService.Spinner().hide('sp6'); })
      ).subscribe((response: any) => {
        if (response) {
          const { postulacion, servidorPublico, informacionServidorPublico } = response;
          this.postulacion = postulacion;
          this.spublico = servidorPublico,
          this.informacionServidorPublico =  informacionServidorPublico    
        } else {
          this.dataService.Message().msgWarning('ERROR AL PROCESAR LA OPERACIÓN.', () => { });
        }
      });
  }

  private configCatch(e: any) {
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if (isArray(e.messages)) {
      if ((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD") != -1)
        this.dataService.Util().msgError(e.messages[0], () => { });
      else
        this.dataService.Util().msgWarning(e.messages[0], () => { });

    } else {
      this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e)
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };
}

