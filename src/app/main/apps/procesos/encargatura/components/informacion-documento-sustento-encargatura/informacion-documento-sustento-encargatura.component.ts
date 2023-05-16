import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material/dialog';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';


@Component({
    selector: "minedu-informacion-documento-sustento-encargatura",
    templateUrl: "./informacion-documento-sustento-encargatura.component.html",
    styleUrls: ["./informacion-documento-sustento-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class InformacionDocumentoSustentoEncargaturaComponent implements OnInit {
    info : any;
    dialogRefPreview: any;

    constructor(
        public dialogRef: MatDialogRef<InformacionDocumentoSustentoEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        this.info = this.data.info;
    }

    ngOnInit(): void {
        console.log(this.info );
    }

    handleCancel() {
        this.dialogRef.close();
    }
    handleVerDocumentoSustento = () => {
        const codigoAdjunto = this.info.codigoAdjuntoSustento;

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE DOCUMENTO DE ESCANEADO."', () => {
            });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(codigoAdjunto)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreview(response, codigoAdjunto);
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO DE ESCANEADO."', () => {
                    });
                }
            });
    };

    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,            
            width: '100%',
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Documento Escaneado',
                    file: file,
                    fileName: codigoAdjuntoSustento
                }
            }
        });

        this.dialogRefPreview.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    };
}