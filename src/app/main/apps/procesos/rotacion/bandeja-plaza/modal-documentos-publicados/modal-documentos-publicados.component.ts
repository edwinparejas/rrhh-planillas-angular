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
import { DatePipe } from "@angular/common";
import { SecurityModel } from 'app/core/model/security/security.model';
import { EstadoDocumentoPublicadoEnum } from '../../_utils/constants';
import { NumberValueAccessor } from "@angular/forms";


@Component({
    selector: 'minedu-modal-documentos-publicados',
    templateUrl: './modal-documentos-publicados.component.html',
    styleUrls: ['./modal-documentos-publicados.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ModalDocumentosPublicadosComponent implements OnInit {

    dialogTitle = "Listado de Documentos Publicados";
    columnTitle = "Pre Publicación"
    working = false;
    isMobile = false;
    dialogRef: any;
    idPlaza: number;
    totalregistro = 0;
    idEtapaProceso: number;
    idGrupoDocumento: number;
    idRegimenLaboral: number;
    idDesarrolloProceso: number;
    codigoCentroTrabajoMaestro:string;
    nombreDocumento: string;
    fecha = new Date();
    paginatorDocumentosPageIndex = 0;
    paginatorDocumentosPageSize = 10;
    @ViewChild("paginatorDocumentos", { static: true }) paginatorDocumentos: MatPaginator;
    dataSourceDocumentosPublicados: PlazasContratacionDocumentosPublicadosDataSource | null;
    
    displayedColumnsDocumentosPublicados: string[] = [
        "registro",        
        "fecha",
        "estado",
        "acciones",
    ];


    request = {
        idDesarrolloProceso: null
    }

    estadoDocumentoEnum = EstadoDocumentoPublicadoEnum;
    idDocumentoPublicado: string;
    currentSession: SecurityModel = new SecurityModel();
    constructor(
        public matDialogRef: MatDialogRef<ModalDocumentosPublicadosComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private datePipe: DatePipe,
        private materialDialog: MatDialog,
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        
        this.idDesarrolloProceso = this.data.idDesarrolloProceso;
        this.buildGrids();
        this.handleBuscar(true);
        this.handleResponsive();
        if (this.data.dialogTitle != null) {
            this.dialogTitle = this.data.dialogTitle;
        }
        if (this.data.columnTitle != null) {
            this.columnTitle = this.data.columnTitle;
        }
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    buildGrids(): void {
        this.dataSourceDocumentosPublicados = new PlazasContratacionDocumentosPublicadosDataSource(this.dataService);        
    }


    ngAfterViewInit() {
        //this.paginatorDocumentos.page.pipe(tap(() => this.handleBuscar())).subscribe();
    }

    handleBuscar(load: boolean = false){
    
        this.request = {
            idDesarrolloProceso: this.idDesarrolloProceso
        };

        this.dataSourceDocumentosPublicados.load(this.request)
 
    }

    handleActualizarEstadoDocumento(idDocumentoPublicado: any) {
    const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA INICIAR EL PROCESO DE GENERACION DE PDF?</strong>";
        this.dataService
        .Message()
        .msgConfirm(confirmationMessage,
                () => {
                const request = {			    
                    idDocumentoPublicado:idDocumentoPublicado,
                    usuarioModificacion:this.currentSession.numeroDocumento,
                    nombreUsuarioModifica:this.currentSession.nombreCompleto,
                    idDesarrolloProceso: this.idDesarrolloProceso
                };
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Rotacion()
                    .generarPdfDocumentoPublicado(request).pipe(
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

    handleActualizarEstadoDocumentoPDF(idDocumentoPublicado: any) {
        const request = {}
        this.dataService
                    .Rotacion()
                    .actualizarEstadosDocumentoPublicados(request).pipe(
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


    handleVerPlazasPublicadas(file: string) {
        if (!file) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ EL DOCUMENTO SOLICITADO."', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(file).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('"ERROR, NO SE PUDO ACCEDER AL SERVICIO."', 'Cerrar'); return of(e); }),
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
                    title: "Proceso Rotación - Plazas Publicadas",
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
        return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm a');
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

    checkboxAllPlazasPrePublicadas(): string {
	let estilo:string = null;
	estilo = `${(this.isAllSelectedPlazasPrepublicadas() || this.isSeleccionadoTodosPrepublicadas) ? "select" : "deselect"} all`;
	return estilo;
    }

    selectedRowPrepublicadas = (row) => {
	this.selectionPlazasPrepublicadas.toggle(row);
	if (!this.isSeleccionadoTodosPrepublicadas) {
	    var existeFila = this.filaSeleccionadasPrePublicadas?.some(x => x.idDocumentoPublicadoDetalle== row.idDocumentoPublicadoDetalle);
	    if(existeFila){
		this.filaSeleccionadasPrePublicadas = this.filaSeleccionadasPrePublicadas?.filter(x => x.idDocumentoPublicadoDetalle != row.idDocumentoPublicadoDetalle);
	    }else{
		this.filaSeleccionadasPrePublicadas.push(row);
	    }
	} 

        if (this.isSeleccionadoTodosPrepublicadas) {
	    var existeFila = this.filaNoSeleccionadas?.some(x => x.idDocumentoPublicadoDetalle == row.idDocumentoPublicadoDetalle);
	    if(existeFila){
		this.filaNoSeleccionadas = this.filaNoSeleccionadas?.filter(x => x.idDocumentoPublicadoDetalle != row.idDocumentoPublicadoDetalle);
	    }else{
		this.filaNoSeleccionadas.push(row);
	    }
        }
        this.idDocumentoPublicado = row.idDocumentoPublicado;
    };

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

}

export class PlazasContratacionDocumentosPublicadosDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    //load(data: any, pageIndex, pageSize): void {
    load(data: any): void {
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService                
                .Rotacion()
                .getBuscarDocumentoPublicado(data)
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
