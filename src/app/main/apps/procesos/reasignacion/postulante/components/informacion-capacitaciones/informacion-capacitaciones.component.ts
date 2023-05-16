import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { saveAs } from 'file-saver';
import { mineduAnimations } from '@minedu/animations/animations';
import { CapacitacionModel } from '../../../models/reasignacion.model';

@Component({
    selector: 'minedu-informacion-capacitaciones',
    templateUrl: './informacion-capacitaciones.component.html',
    styleUrls: ['./informacion-capacitaciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionCapacitacionesComponent implements OnInit {
    dialogTitle = 'Ver información de capacitaciones';
    capacitaciones: CapacitacionModel;
    working = false;

    constructor(
        public matDialogRef: MatDialogRef<InformacionCapacitacionesComponent>,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ) { }

    ngOnInit(): void {
        this.capacitaciones = this.data.row;
    }
    handleCancel = () => {
        this.matDialogRef.close();
    }

    descargarResolucion = () => {
        const data = this.capacitaciones;
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
