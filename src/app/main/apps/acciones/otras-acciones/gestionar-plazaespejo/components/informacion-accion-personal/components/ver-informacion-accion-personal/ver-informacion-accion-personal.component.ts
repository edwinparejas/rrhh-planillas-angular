import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DesplazamientoAccionCodigoEnum } from '../../../../types/Enums';


@Component({
    selector: 'minedu-ver-informacion-accion-personal',
    templateUrl: './ver-informacion-accion-personal.component.html',
    styleUrls: ['./ver-informacion-accion-personal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerInformacionAccionPersonalComponent implements OnInit, OnDestroy {
    @Input('accionPersonal')
    accionPersonal: any;


    private dialogRef: any;
    private _unsubscribeAll: Subject<any>;


    PERMUTA: number = DesplazamientoAccionCodigoEnum.PERMUTA;   


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
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(codigoAdjunto)
            .pipe(
                catchError((e) => {
                    return of(null);
                }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
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


