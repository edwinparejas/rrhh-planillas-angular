import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { DocumentosPublicadosPrepublicacionComponent } from "../documentos-publicados-prepublicacion/documentos-publicados-prepublicacion.component";
import { saveAs } from 'file-saver';
import { GrupoDocumentoReasignacionEnum } from "../../_utils/constants";
import { DocumentosPublicadosComponent } from "../documentos-publicados/documentos-publicados.component";
import { DatePipe } from '@angular/common';


@Component({
    selector: "minedu-documentos-prepublicados-fecha",
    templateUrl: "./documentos-prepublicados-fecha.component.html",
    styleUrls: ["./documentos-prepublicados-fecha.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class DocumentosPrepublicadosFechaComponent implements OnInit {
    dialogTitle = "Pre Publicación de plazas de reasignación";
    columnTitle = "Pre Publicación"
    working = false;
    isMobile = false;
    dialogRef: any;
    idPlaza: number;
    totalregistro = 0;
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    idGrupoDocumento: number;
    nombreDocumento: string;
    fecha = new Date();
    paginatorDocumentosPageIndex = 0;
    paginatorDocumentosPageSize = 10;
    @ViewChild("paginatorDocumentos", { static: true }) paginatorDocumentos: MatPaginator;
    dataSourceDocumentosPublicados: PlazasReasignacionDocumentosPublicadosDataSource | null;
    
    displayedColumnsDocumentosPublicados: string[] = [
        "registro",
        "fecha",
        "activo",
        "acciones",
    ];

    request = {
        idEtapaProceso: null,
        idGrupoDocumento: null,
        idDesarrolloProceso: null
        // anio: null
    };

    constructor(
        public matDialogRef: MatDialogRef<DocumentosPrepublicadosFechaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private materialDialog: MatDialog,
        private dataService: DataService,
        private datePipe: DatePipe
    ) { }

    ngOnInit(): void {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.idDesarrolloProceso = this.data.idDesarrolloProceso;
        this.idGrupoDocumento = this.data.idGrupoDocumento;
        this.nombreDocumento = this.data.nombreDocumento;
        this.buildGrids();
        this.handleBuscar(true);
        this.handleResponsive();
        if (this.data.dialogTitle != null) {
            this.dialogTitle = this.data.dialogTitle;
        }
        if (this.data.columnTitle != null) {
            this.columnTitle = this.data.columnTitle;
        }
    }

    buildGrids(): void {
        this.dataSourceDocumentosPublicados = new PlazasReasignacionDocumentosPublicadosDataSource(this.dataService);
        this.buildPaginators(this.paginatorDocumentos);
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
    }

    ngAfterViewInit() {
        this.paginatorDocumentos.page.pipe(tap(() => this.handleBuscar())).subscribe();
    }

    handleBuscar(load: boolean = false){
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            idGrupoDocumento: this.idGrupoDocumento,
            // anio: this.fecha.getFullYear()
        };

        if (load) {
            this.dataSourceDocumentosPublicados.load(this.request, this.paginatorDocumentos.pageIndex + 1, this.paginatorDocumentosPageSize);
        } else {
            this.dataSourceDocumentosPublicados.load(this.request, this.paginatorDocumentos.pageIndex + 1, this.paginatorDocumentos.pageSize);
        }
    }

    handleVerListaPlazasPublicadas(fecha: string) {
        if (!fecha) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ EL DOCUMENTO SOLICITADO."', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");

        /*this.dataService.Documento().descargar(file).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('Error, no se pudo acceder al servicio.', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                this.handlePreview(response, this.nombreDocumento);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO SOLICITADO."', () => { });
            }
        });*/



        this.handleCancel()
    }

    handleVerPlazasPdf(row:any) {

            this.dialogRef = this.materialDialog.open(DocumentosPublicadosPrepublicacionComponent, {
            // panelClass: 'documentos-publicados-prepublicacion',
            panelClass: 'minedu-modal-documentos-publicados-prepublicacion',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idDesarrolloProceso: this.idDesarrolloProceso,
                idGrupoDocumento: GrupoDocumentoReasignacionEnum.PREPUBLICACION_PLAZAS,
                nombreDocumento:  'Plazas_Reasignación',
                idDocumentoPublicado: row.idDocumentoPublicado,
                codigoDocumentoPublicacion: row.codigo,
                activo: row.activo
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            }
        );
        // this.dialogRef = this.materialDialog.open(DocumentosPublicadosComponent, {
        //     panelClass: 'minedu-modal-documentos-publicados-prepublicacion',
        //     disableClose: true,
        //     data: {
        //         idEtapaProceso: this.idEtapaProceso,
        //         idGrupoDocumento: GrupoDocumentoReasignacionEnum.PREPUBLICACION_PLAZAS,
        //         nombreDocumento: 'Plazas_Reasignación',
        //         dialogTitle:"Pre Publicación de plazas",
        //         codigoDocumentoPublicacion: row.codigo
        //     }
        // });
        
        // this.dialogRef.afterClosed()
        //     .subscribe((response: any) => {
        //         if (!response) {
        //             return;
        //         }
        //     }
        // );
    }

    handleVerPlazasPublicadas(file: string) {
        if (!file) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ EL DOCUMENTO SOLICITADO."', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(file).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('Error, no se pudo acceder al servicio.', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                this.handlePreview(response, this.nombreDocumento);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO SOLICITADO."', () => { });
            }
        });
    }

    handlePreview(file: any, nameFile: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Proceso Contratación - Plazas Publicadas",
                    file: file
                }
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                if (response.download) {
                    saveAs(file, nameFile + ".pdf");
                }
            }
        );
    }

    handleCancel = () => { this.matDialogRef.close(); }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    transformarFecha(date){
        // return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm a');
        return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm');
    }

}

export class PlazasReasignacionDocumentosPublicadosDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
            .Reasignaciones()
            .getBuscarDocumentoPublicadoPorFecha(data, pageIndex, pageSize)
            // .getPrepublicaciones(data, pageIndex, pageSize)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((documentosPublicados: any) => {
                this._dataChange.next(documentosPublicados || []);
                this.totalregistro = (documentosPublicados || []).length === 0 ? 0 : documentosPublicados[0].total_registros;
            });
        }
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalregistro;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}
