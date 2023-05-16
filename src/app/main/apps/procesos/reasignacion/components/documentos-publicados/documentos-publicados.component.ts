import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { MatPaginator } from "@angular/material/paginator";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { saveAs } from 'file-saver';


@Component({
    selector: 'minedu-documentos-publicados',
    templateUrl: './documentos-publicados.component.html',
    styleUrls: ['./documentos-publicados.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class DocumentosPublicadosComponent implements OnInit {

    dialogTitle = "Listado de Documentos Publicados";
    working = false;
    isMobile = false;
    dialogRef: any;
    idPlaza: number;
    totalregistro = 0;
    idEtapaProceso: number;
    idAlcanceProceso: number;
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
        "acciones",
    ];

    request = {
        idEtapaProceso: null,
        idAlcanceProceso: null,
        idGrupoDocumento: null,
        anio: null
    };

    constructor(
        public matDialogRef: MatDialogRef<DocumentosPublicadosComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private materialDialog: MatDialog,
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.idAlcanceProceso = this.data.idAlcanceProceso;
        this.idGrupoDocumento = this.data.idGrupoDocumento;
        this.nombreDocumento = this.data.nombreDocumento;
        this.buildGrids();
        this.handleBuscar(true);
        this.handleResponsive();
        if (this.data.dialogTitle != null) {
            this.dialogTitle = this.data.dialogTitle;
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
            idAlcanceProceso: this.idAlcanceProceso,
            idGrupoDocumento: this.idGrupoDocumento,
            anio: this.fecha.getFullYear()
        };

        if (load) {
            this.dataSourceDocumentosPublicados.load(this.request, this.paginatorDocumentos.pageIndex + 1, this.paginatorDocumentosPageSize);
        } else {
            this.dataSourceDocumentosPublicados.load(this.request, this.paginatorDocumentos.pageIndex + 1, this.paginatorDocumentos.pageSize);
        }
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
                    title: "Proceso Reasignación - Plazas Publicadas",
                    file: file,
                    fileName: "PLAZAS_PUBLICADAS"
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
            this.dataService.Reasignaciones().getBuscarDocumentoPublicado(data, pageIndex, pageSize).pipe(
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
