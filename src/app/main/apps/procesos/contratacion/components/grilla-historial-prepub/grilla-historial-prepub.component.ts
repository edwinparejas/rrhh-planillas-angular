import { Component, OnInit, ViewChild, Inject, Input, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from "app/core/data/data.service";
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { catchError, finalize, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from "rxjs";
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-grilla-historial-prepub',
  templateUrl: './grilla-historial-prepub.component.html',
  styleUrls: ['./grilla-historial-prepub.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class GrillaHistorialPrepubComponent implements OnInit {
    esbecario:boolean = false;
    dialogTitle = "Listado de plazas de contratacion docente por DRE";//"Ver Listado de plazas por DRE";
    working = false;
    isMobile = false;
    dialogRef: any;
    idPlaza: number;
    totalregistro = 0;
    @Input() idEtapaProceso: string;
    @Input() idGrupoDocumento: string;
    @Input() nombreDocumento: string;
    fecha = new Date();
    paginatorDocumentosPageIndex = 0;
    paginatorDocumentosPageSize = 10;
    @ViewChild("paginatorDocumentos", { static: true })
    paginatorDocumentos: MatPaginator;
    dataSourceDocumentosPublicados: any;

    displayedColumnsDocumentosPublicados: string[] = [
        "registro",
        "fechaPublicacion",
        "acciones",
    ];

    request = {
        idEtapaProceso: null,
        idGrupoDocumento: null,
        anio: null,
    };

  constructor(
        public matDialogRef:
	    MatDialogRef<GrillaHistorialPrepubComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private materialDialog: MatDialog,
        private dataService: DataService
  ) { }

  ngOnInit(): void {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.idGrupoDocumento = this.data.idGrupoDocumento;
        this.nombreDocumento = this.data.nombreDocumento;
        this.esbecario = this.data.esbecario;
        this.buildGrids();
        this.handleBuscar(true);
        this.handleResponsive();
  }
    buildGrids(): void {
        this.dataSourceDocumentosPublicados =
            new PlazasContratacionDocumentosPublicadosDataSource(
                this.dataService
            );
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
        this.paginatorDocumentos.page
            .pipe(tap(() => this.handleBuscar()))
            .subscribe();
    }

    handleBuscar(load: boolean = false) {
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idGrupoDocumento: this.idGrupoDocumento,
            anio: this.fecha.getFullYear(),
        };

        if (load) {
            this.dataSourceDocumentosPublicados.load(
                this.request,
                this.paginatorDocumentos.pageIndex + 1,
                this.paginatorDocumentosPageSize
            );
        } else {
            this.dataSourceDocumentosPublicados.load(
                this.request,
                this.paginatorDocumentos.pageIndex + 1,
                this.paginatorDocumentos.pageSize
            );
        }
    }

    handleVerPlazasPublicadas(file: string, esbecario:boolean=false, nombreDre:string) {
        if (!file) {
            this.dataService
                .Message()
                .msgWarning(
                    '"NO SE ENCONTRÓ EL DOCUMENTO SOLICITADO."',
                    () => {}
                );
            return;
        }
        if(esbecario)
            this.nombreDocumento = this.nombreDocumento+"-"+nombreDre+"-"+new Date().toJSON().slice(0,10) ;//"becario"+ "_" + new Date().toJSON().slice(0,10) ; // "Plazas_para_Becarios-"
        else
            this.nombreDocumento = this.nombreDocumento+"-"+nombreDre+"-"+new Date().toJSON().slice(0,10) ; //"Plazas_Contratación_Docente-"
        
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(file)
            .pipe(
                catchError((e) => {
                    this.dataService
                        .SnackBar()
                        .msgError(
                            "Error, no se pudo acceder al servicio.",
                            "Cerrar"
                        );
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                if (response) {
                    this.handlePreview(response, this.nombreDocumento);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE PUDO OBTENER EL DOCUMENTO SOLICITADO."',
                            () => {}
                        );
                }
            });
    }

    handlePreview(file: any, nameFile: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Proceso Contratación - Plazas Publicadas",
                    file: file,
                    fileName:nameFile
                },
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
            if (response.download) {
                saveAs(file, nameFile + ".pdf");
            }
        });
    }

    handleCancel = () => {
        this.matDialogRef.close();
    };

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

export class PlazasContratacionDocumentosPublicadosDataSource 
             extends DataSource<any> {
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
                .Contrataciones()
                .getBuscarDocumentoPublicadoPorDre(data, pageIndex, pageSize) // .getBuscarDocumentoPublicado(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((documentosPublicados: any) => {
                    this._dataChange.next(documentosPublicados || []);
                    this.totalregistro =
                        (documentosPublicados || []).length === 0
                            ? 0
                            : documentosPublicados[0].total_registros;
                });
        }
    }

    connect(collectionViewer: CollectionViewer)
	: Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer)
	: void {
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
function saveAs(file: any, arg1: string) {
    throw new Error("Function not implemented.");
}

