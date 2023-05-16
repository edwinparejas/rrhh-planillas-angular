import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { saveAs } from 'file-saver';
import { of } from 'rxjs';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DocumentoSustentoModel } from '../../models/reasignacion.model';


@Component({
    selector: 'minedu-informacion-documento-sustento',
    templateUrl: './informacion-documento-sustento.component.html',
    styleUrls: ['./informacion-documento-sustento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionDocumentoSustentoOldComponent implements OnInit {
    dialogTitle = 'Ver información de sustento';
    documentosSustento: DocumentoSustentoModel;
    working = false;
    constructor(
        public matDialogRef: MatDialogRef<InformacionDocumentoSustentoOldComponent>,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ) { }

    ngOnInit(): void {
        debugger;
        this.documentosSustento = this.data.row;
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    descargarResolucion = () => {
        const data = this.documentosSustento;
        /*    if (data.codigoDocumentoSustento === null || data.codigoDocumentoSustento === '00000000-0000-0000-0000-000000000000' ||
               data.codigoDocumentoSustento === '') {
               this.dataService.Message().msgWarning('No tiene Documento sustento.', () => { });
               return;
           }  */
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(data.codigoDocumentoSustento)
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
