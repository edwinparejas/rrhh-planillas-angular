import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import { mineduAnimations } from "@minedu/animations/animations";
import {MAT_DIALOG_DATA, MatDialogRef, MatDialog} from '@angular/material/dialog';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {CollectionViewer, DataSource, SelectionModel} from '@angular/cdk/collections';
import {saveAs} from "file-saver";
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { InformacionDocumentoSustentoEncargaturaComponent } from '../informacion-documento-sustento-encargatura/informacion-documento-sustento-encargatura.component';

@Component({
    selector: 'minedu-motivo-no-publicacion-plaza-encargatura',
    templateUrl: './motivo-no-publicacion-plaza-encargatura.component.html',
    styleUrls: ['./motivo-no-publicacion-plaza-encargatura.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class MotivoNoPublicacionPlazaEncargaturaComponent implements OnInit {
    idPlazaEncargaturaDetalle : number;
    plazaEncargatura: any;
    loading = false;
    usuario:string;
    displayedColumns: string[] = [
        "rowNum",
        "tipoDocumento",
        "numeroDocumento",
        "tipoFormato",
        "folios",
        "fechaEmision",
        "fechaRegistro",
        "acciones"
    ];
    dataSource: DocumentoSustentoDataSource | null;

    dialogRefPreview: any;
    constructor(
        public dialogRef: MatDialogRef<MotivoNoPublicacionPlazaEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) {
        this.idPlazaEncargaturaDetalle = this.data.idPlazaEncargaturaDetalle;
        this.usuario=this.data.usuario;
    }

    ngOnInit(): void {
        this.dataSource = new DocumentoSustentoDataSource(this.dataService);
        this.loadMotivoNoPublicacionPlazaEncargatura();
        this.searchDocumentoSustento(true);
    }

    loadMotivoNoPublicacionPlazaEncargatura() {
        this.dataService.Encargatura().getMotivoNoPublicacionPlazaEncargatura(this.idPlazaEncargaturaDetalle).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.plazaEncargatura = {
                    idPlazaEncargaturaDetalle: result.idPlazaEncargaturaDetalle,
                    descripcionMotivoNoPublicacion: result.descripcionMotivoNoPublicacion,
                    detalleNoPublicacion: result.detalleNoPublicacion
                }
            }
        });
    }

    searchDocumentoSustento(firstTime: boolean = false) {
        const data = {
            idPlazaEncargaturaDetalle: this.idPlazaEncargaturaDetalle
        };
        console.log('searchDocumentoSustento: ', data);
        this.dataSource.load(data, firstTime);
    }

    // handleDownloadAdjuntoSustento(row: any) {
    //     if (row.codigoAdjuntoSustento == null) {
    //         this.dataService.Message().msgWarning('No tiene Documento sustento.', () => {});
    //         return;
    //     }
    //     const request = row.codigoAdjuntoSustento;
    //     this.loading = true;
    //     this.dataService.Spinner().show("sp6");
    //     this.dataService.Encargatura().downloadDocumentoSustento(request).pipe(catchError((e) => of(e)), finalize(() => {
    //         this.dataService.Spinner().hide("sp6")
    //         this.loading = false;
    //     })).subscribe(result => {
    //         if (result) {
    //             saveAs(result, "documentosustento.pdf");
    //         } else {
    //             this.dataService.Message().msgWarning("No se pudo descargar documento sustento", () => {});
    //         }
    //     });
    // }

    handleViewDocumentoSustento(row: any){
        this.materialDialog.open(InformacionDocumentoSustentoEncargaturaComponent, {
            panelClass: 'minedu-informacion-documento-sustento-encargatura',
            width: '500px',
            disableClose: true,
            data: {
                info: row
            }
        });
    }
    
    handleDownloadAdjuntoSustento(row: any) {
    
        const codigoAdjunto = row.codigoAdjuntoSustento;

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE DOCUMENTO DE SUSTENTO."', () => {
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
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO."', () => {
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
                    title: 'Documento de sustento',
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
    handleCancel() {
        this.dialogRef.close();
    }
}

export class DocumentoSustentoDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, firstTime = false) : void {
        this._loadingChange.next(false);
        if (!firstTime) {
            this.dataService.Spinner().show("sp6");
        }
        this.dataService.Encargatura().searchDocumentoSustentoPaginado(data).pipe(catchError(() => of([])), finalize(() => {
            this._loadingChange.next(false);
            if (!firstTime) {
                this.dataService.Spinner().hide("sp6");
            }
        })).subscribe((result: any) => {
            this._dataChange.next(result || []);
            if ((result || []).length === 0) {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE PLAZAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
            }
        });
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalRegistros;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}