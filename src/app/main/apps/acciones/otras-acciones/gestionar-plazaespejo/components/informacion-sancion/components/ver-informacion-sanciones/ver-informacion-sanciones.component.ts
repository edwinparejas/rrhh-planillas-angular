import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { DataService } from '../../../../../../../../../core/data/data.service';

@Component({
    selector: 'minedu-ver-informacion-sanciones',
    templateUrl: './ver-informacion-sanciones.component.html',
    styleUrls: ['./ver-informacion-sanciones.component.scss']
})
export class VerInformacionSancionesComponent implements OnInit, OnDestroy {

    @Input("sancion")
    sancion: any;

    @Input("actividadResolucion")
    actividadResolucion: any;

    @Input("ver")
    ver = false;

    @Input("form")
    form: FormGroup;


    private dialogRef: any;
    private _unsubscribeAll: Subject<any>;


    constructor(private dataService: DataService, private materialDialog: MatDialog) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void { }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    mostrarDocumento({ documento, tituloModal }) {
        this.handleVerDocumentoSustento(documento, tituloModal);
    }


    private handleVerDocumentoSustento(codigoAdjunto: string, tituloModal: string) {

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('NO SE TIENE UN DOCUMENTO REGISTRADO.', () => {
            });
            return;
        }
        this.dataService.Documento().descargar(codigoAdjunto)
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe(response => {
                if (response) {
                    this.handlePreview(response, codigoAdjunto, tituloModal);
                } else {
                    this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO.', () => {
                    });
                }
            });
    };

    private handlePreview(file: any, codigoAdjuntoSustento: string, tituloModal: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: tituloModal,
                    file: file,
                    fileName: codigoAdjuntoSustento
                }
            }
        });

        this.dialogRef.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    };

}
