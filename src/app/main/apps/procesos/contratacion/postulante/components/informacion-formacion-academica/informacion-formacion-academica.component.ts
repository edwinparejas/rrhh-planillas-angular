import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { FormacionAcademicaModel } from '../../../models/contratacion.model';
import { saveAs } from 'file-saver';

@Component({
  selector: 'minedu-informacion-formacion-academica',
  templateUrl: './informacion-formacion-academica.component.html',
  styleUrls: ['./informacion-formacion-academica.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class InformacionFormacionAcademicaComponent implements OnInit {
    dialogTitle = 'Ver información de formación académica';
    formacionAcademica: FormacionAcademicaModel;
    working = false;
  constructor(
    public matDialogRef: MatDialogRef<InformacionFormacionAcademicaComponent>,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) { }

  ngOnInit(): void {
    this.formacionAcademica = this.data.row;
  }
  
  handleCancel = () => {
    this.matDialogRef.close();
}

descargarResolucion = () => {
    const data = this.formacionAcademica;
    /*    if (data.codigoDocumentoSustento === null || data.codigoDocumentoSustento === '00000000-0000-0000-0000-000000000000' ||
           data.codigoDocumentoSustento === '') {
           this.dataService.Message().msgWarning('No tiene Documento sustento.', () => { });
           return;
       }  */
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(data.codigoAdjuntoSustento)
        .pipe(
            catchError((e) => of(null)),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                saveAs(response, 'documentosustento.pdf');
            } else {
                this.dataService.Message().msgWarning('No se pudo descargar documento sustento', () => { });
            }
        });
}

}
