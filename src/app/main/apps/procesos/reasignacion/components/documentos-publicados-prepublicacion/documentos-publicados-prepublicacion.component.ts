import { CollectionViewer, DataSource, SelectionModel} from "@angular/cdk/collections";
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { BehaviorSubject, Observable, of } from "rxjs";
import { SecurityModel } from 'app/core/model/security/security.model';
import { catchError, finalize, tap } from "rxjs/operators";
import { EstadoDocumentoEnum } from '../../_utils/constants';
const dutchRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length == 0 || pageSize == 0) { return `0 de ${length}`; }   
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
  
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
  
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }

@Component({
    selector: "minedu-documentos-publicados-prepublicacion",
    templateUrl: "./documentos-publicados-prepublicacion.component.html",
    styleUrls: ["./documentos-publicados-prepublicacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
    // animations: mineduAnimations,
    // encapsulation: ViewEncapsulation.None,
})
export class DocumentosPublicadosPrepublicacionComponent
    implements OnInit
{
    esbecario:boolean = false;
    dialogTitle = "Pre publicación de plazas de Reasignación";
    working = false;
    isMobile = false;
    dialogRef: any;
    idPlaza: number;
    totalregistro = 0;
    idEtapaProceso: number;
    idDesarrolloProceso: number;
    idGrupoDocumento: number;
    nombreDocumento: string;
    codigoDocumentoPublicacion: string;
    idDocumentoPublicado: number;
    activo: boolean;
    fecha = new Date();
    paginatorDocumentosPageIndex = 0;
    paginatorDocumentosPageSize = 10;
    @ViewChild("paginatorDocumentos", { static: true })
    paginatorDocumentos: MatPaginator;
    dataSourceDocumentosPublicados: PlazasContratacionDocumentosPublicadosDataSource | null;

    displayedColumnsDocumentosPublicados: string[] = [
        "registro",
        "fecha",
        "estado",
        "acciones",
    ];

    request = {
        idEtapaProceso: null,
        idGrupoDocumento: null,
        codigoDocumentoPublicacion: null,
        idDocumentoPublicado: null
    };
    estadoDocumentoEnum = EstadoDocumentoEnum;

    constructor(
        public matDialogRef: MatDialogRef<DocumentosPublicadosPrepublicacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private materialDialog: MatDialog,
        private dataService: DataService
    ) {}

    currentSession: SecurityModel = new SecurityModel();
    ngOnInit(): void {
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.idDesarrolloProceso = this.data.idDesarrolloProceso;
        this.idGrupoDocumento = this.data.idGrupoDocumento;
        this.nombreDocumento = this.data.nombreDocumento;
        this.idDocumentoPublicado = this.data.idDocumentoPublicado;
        this.codigoDocumentoPublicacion = this.data.codigoDocumentoPublicacion;
        this.activo = this.data.activo;
        this.buildGrids();
        this.handleBuscar(true);
        this.handleResponsive();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
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
        paginator._intl.getRangeLabel = dutchRangeLabel;
    }

    isSeleccionadoTodosPrepublicadas: boolean = false;
    filaSeleccionadasPrePublicadas:any[]=[];
    filaNoSeleccionadas:any[]=[];
    selectionPlazasPrepublicadas = new SelectionModel<any>(true, []);

    masterTogglePlazasPrepublicadas = ({checked}) => {
	this.isSeleccionadoTodosPrepublicadas = checked;
	this.filaSeleccionadasPrePublicadas = [];
	this.filaNoSeleccionadas = [];
    };

    isAllSelectedPlazasPrepublicadas = () => {
        const numSelected = this.selectionPlazasPrepublicadas.selected.length;
        const numRows = this.dataSourceDocumentosPublicados.data.length;
        return numSelected === numRows;
    };

    selectedRowPrepublicadas = (row) => {
        this.selectionPlazasPrepublicadas.toggle(row);
        if (!this.isSeleccionadoTodosPrepublicadas) {
          var existeFila = this.filaSeleccionadasPrePublicadas?.some(x => x.idDocumentoPublicadoDetalle == row.idDocumentoPublicadoDetalle);
          if (existeFila) {
            this.filaSeleccionadasPrePublicadas = this.filaSeleccionadasPrePublicadas?.filter(x => x.idDocumentoPublicadoDetalle != row.idDocumentoPublicadoDetalle);
          } else {
            this.filaSeleccionadasPrePublicadas.push(row);
          }
        }
    
        if (this.isSeleccionadoTodosPrepublicadas) {
          var existeFila = this.filaNoSeleccionadas?.some(x => x.idDocumentoPublicadoDetalle == row.idDocumentoPublicadoDetalle);
          if (existeFila) {
            this.filaNoSeleccionadas = this.filaNoSeleccionadas?.filter(x => x.idDocumentoPublicadoDetalle != row.idDocumentoPublicadoDetalle);
          } else {
            this.filaNoSeleccionadas.push(row);
          }
        }
        this.idDocumentoPublicado = row.idDocumentoPublicado;
      };

    checkboxAllPlazasPrePublicadas(): string {
	let estilo:string = null;
	estilo = `${(this.isAllSelectedPlazasPrepublicadas() || this.isSeleccionadoTodosPrepublicadas) ? "select" : "deselect"} all`;
	return estilo;
    }

    
    verificaSeleccionPrePublicadas = (row):boolean =>{
        if(!this.isSeleccionadoTodosPrepublicadas) {
            let estaSeleccioando = this.filaSeleccionadasPrePublicadas
                        .some(fila => 
                              fila.idDocumentoPublicadoDetalle 
                              == row.idDocumentoPublicadoDetalle);
            return estaSeleccioando || this.isSeleccionadoTodosPrepublicadas;
        }
    
        if(this.isSeleccionadoTodosPrepublicadas) {
            let estaSeleccioando = this.filaNoSeleccionadas
                        .some(fila => 
                              fila.idDocumentoPublicadoDetalle 
                              == row.idDocumentoPublicadoDetalle);
            return !estaSeleccioando;
        }
    }

    checkboxLabelPlazasPrepublicadas(row?: any): string {
    let estilo: string = null;
        estilo =  `${this.selectionPlazasPrepublicadas.isSelected(row) ? "deselect" : "select"} row ${row?.position + 1}`;
        return  estilo;
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
            codigoDocumentoPublicacion: this.codigoDocumentoPublicacion,
            idDocumentoPublicado: this.idDocumentoPublicado
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

    handleIniciarGeneracionPdf = () => {
        if(
            (
            this.filaSeleccionadasPrePublicadas.length == 0 && !this.isSeleccionadoTodosPrepublicadas
            )
          ) {
            return this.dataService
                .Message()
            .msgWarning('"SELECIONE DOCUMENTOS PARA INCIAR EL PROCESO DE GENERACION DE PDF"', () => { });
        }
    
        const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA INICIAR EL PROCESO DE GENERACION DE PDF?</strong>";
        this.dataService
        .Message()
        .msgConfirm(confirmationMessage,
                () => {
                const request = {
                    seleccionados :this.filaSeleccionadasPrePublicadas,
                    esSelecionarTodo :this.isSeleccionadoTodosPrepublicadas,
                    noSeleccionandos :this.filaNoSeleccionadas,
                    idDocumentoPublicado:this.idDocumentoPublicado,
                    usuarioModificacion:this.currentSession.numeroDocumento
                };
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Reasignaciones()
                    .actualizarEstadoDocumento(request).pipe(
                    catchError(() => of([])),
                    finalize(() => { this.dataService.Spinner().hide("sp6"); })
                )
                .subscribe((result: number) => {
                    if(result == 1){
                    return this.dataService
                    .Message()
                    .msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, 
                                     () => {
                                     this.matDialogRef.close();
                                     });
    
                    }
                    return this.dataService
                    .Message()
                    .msgWarning('"OCURRIO UN ERROR AL PROCESO LA INFORMACION"', () => {});
                });
                }
               );
        }

    handleVerPlazasPublicadas(file: string, nombreDre:string) {
        if (!file) {
            this.dataService
                .Message()
                .msgWarning(
                    '"NO SE ENCONTRÓ EL DOCUMENTO SOLICITADO."',
                    () => {}
                );
            return;
        }

        let nombreDocumentoDescargado = this.nombreDocumento+"-"+nombreDre+"-"+new Date().toJSON().slice(0,10) ;        
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
                    this.handlePreview(response, nombreDocumentoDescargado);
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
                    title: "Proceso Reasignación - Plazas Pre Publicadas",
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

export class PlazasContratacionDocumentosPublicadosDataSource extends DataSource<any> {
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
                .getBuscarDocumentoPublicadoPorDre(data, pageIndex, pageSize) 
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
function saveAs(file: any, arg1: string) {
    throw new Error("Function not implemented.");
}

