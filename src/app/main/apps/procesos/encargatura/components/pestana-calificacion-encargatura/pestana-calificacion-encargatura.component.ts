import { Component, Inject, Input, LOCALE_ID, OnChanges, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataService } from '../../../../../../core/data/data.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { RegistroObservacionPostulanteEncargaturaComponent } from '../registro-observacion-postulante-encargatura/registro-observacion-postulante-encargatura.component';
import { RegistroReclamoPostulanteEncargaturaComponent } from '../registro-reclamo-postulante-encargatura/registro-reclamo-postulante-encargatura.component';
import { ObservacionCalificacionEncargaturaComponent } from '../observacion-calificacion-encargatura/observacion-calificacion-encargatura.component';
import { ReclamoCalificacionEncargaturaComponent } from '../reclamo-calificacion-encargatura/reclamo-calificacion-encargatura.component';
import { EstadoCalificacionEnum, EtapaEnum, ResultadoCalificacionEnum } from '../../_utils/constants';
import { saveAs } from "file-saver";
import { ENCARGATURA_MESSAGE } from '../../_utils/message';
import { SecurityModel } from 'app/core/model/security/security.model';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: "minedu-pestana-calificacion-encargatura",
    templateUrl: "./pestana-calificacion-encargatura.component.html",
    styleUrls: ["./pestana-calificacion-encargatura.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PestanaCalificacionEncargaturaComponent implements OnInit, OnChanges {
    loading = false;
    export = false;
    displayedColumns: string[];
    dataSource: CalificacionDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @Input() selectedTabIndex: number;
    @Input() idEtapaProceso: number;
    @Input() idDesarrolloProceso: number;
    @Input() codigoEtapa: number;
    @Input() codigoResultadoCalificacion: number;
    @Input() controlesActivos: any;
    @Input() currentSession: SecurityModel = new SecurityModel(); 
    EstadoCalificacionEnum=EstadoCalificacionEnum
    etapaEnum = EtapaEnum;
    resultadoCalificacionEnum = ResultadoCalificacionEnum;
    documentoPublicado: any;
    documentoPublicadoPreliminar: any;
    dialogRef: any;
    request: any;
    isMobile = false;
    visibleImportarInformeEscalafonarioSolicitados:boolean;
    visibleResultadoPreliminar:boolean;
    visibleResultadoFinal:boolean;
    visibleCuadroPreliminar:boolean;
    visibleCuadroFinal:boolean;
    visibleGenerarOrdenMerito:boolean;
    visibleExportar:boolean;
    visibleObservarPostulante:boolean;
    visibleRegistrarReclamo:boolean;    
    dialogRefPreview: any;
    visibleEvaluarCriterio: any;
    visibleEvaluarCuadroMerito: any;
    tienePendiente:boolean=false;
    tieneOrdenMerito:boolean=false;
        getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    constructor(
        private dataService: DataService,
        private materialDialog: MatDialog,        
        @Inject(LOCALE_ID) private locale: string,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnChanges(): void {
        this.initializeComponent();
    }
    initializeComponent() {
        this.visibleImportarInformeEscalafonarioSolicitados=(this.selectedTabIndex == 0?this.controlesActivos.btnImportarInformeEscalafonarioSolicitados:false);
        this.visibleGenerarOrdenMerito=this.controlesActivos.btnGenerarOrdenMerito;
        this.visibleCuadroPreliminar=(this.selectedTabIndex == 0?this.controlesActivos.btnPublicarCuadroPreliminar:false);
        this.visibleCuadroFinal=(this.selectedTabIndex == 1?this.controlesActivos.btnPublicarCuadroFinal:false);

        this.visibleResultadoPreliminar=(this.selectedTabIndex == 0?this.controlesActivos.btnPublicarResultadoPreliminar:false);
        this.visibleResultadoFinal=(this.selectedTabIndex == 1?this.controlesActivos.btnPublicarResultadoFinal:false);

        // this.visibleEvaluarCuadroMerito=this.controlesActivos.btnEvaluarCuadroMerito;
        // this.visibleEvaluarCriterio=this.controlesActivos.btnRealizarEvaluacion;
        this.visibleEvaluarCuadroMerito=this.controlesActivos.btnRealizarCalificacion;        
        this.visibleEvaluarCriterio=this.controlesActivos.btnRealizarCalificacion;
        this.visibleObservarPostulante=this.controlesActivos.btnObservarPostulante;
        this.visibleRegistrarReclamo=this.controlesActivos.btnRegistrarReclamo;


        
        // //todo quitar esto es temporal para probar las opciones
        // this.visibleResultadoPreliminar=(this.selectedTabIndex == 0);
        // this.visibleResultadoFinal=(this.selectedTabIndex == 1);
        // this.visibleCuadroPreliminar=(this.selectedTabIndex == 0);
        // this.visibleCuadroFinal=(this.selectedTabIndex == 1);
        // this.visibleGenerarOrdenMerito=true;
        // this.visibleObservarPostulante=true;
        // this.visibleRegistrarReclamo=true;
        // this.visibleEvaluarCuadroMerito=true;
        // this.visibleEvaluarCriterio=true;

        this.visibleExportar=this.controlesActivos.btnExportar;
    }
    
    ngOnInit(): void {
        this.dataSource = new CalificacionDataSource(this.dataService);
        this.setDisplayedColumns();
        this.handleResponsive();
        if(this.selectedTabIndex == 1){
            this.loadDocumentoPublicadoPreliminar();
        }
        else{

        }
        this.loadDocumentoPublicado();        
        this.loadPendientes();
        if (this.codigoEtapa != EtapaEnum.RatificacionCargo) {            
            this.loadOrdenMerito();
        }
        if (this.selectedTabIndex == 0) {
            this.setRequest();
            this.searchCalificacionEncargatura(true);
        }

        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
    }

    

    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.searchCalificacionEncargatura(false))).subscribe();
    }

    updateLista(request: any) {
        this.request = request;
        if(this.selectedTabIndex == 1){
            this.loadDocumentoPublicadoPreliminar();
        }
        this.loadDocumentoPublicado();
        this.loadPendientes();
        this.searchCalificacionEncargatura(true);
        this.initializeComponent();
    }

    handleResponsive() {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    loadDocumentoPublicadoPreliminar() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            codigoResultadoCalificacion: 1
        };
        this.dataService.Encargatura().getDocumentoPublicadoCalificacionEncargatura(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.documentoPublicadoPreliminar = {
                    idDocumentoPublicado: result.idDocumentoPublicado,
                    codigoDocumentoGenerado: result.codigoDocumentoGenerado
                }
            }
            else{
                this.documentoPublicadoPreliminar=null;
            }
        });
    }  
    loadDocumentoPublicado() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            codigoResultadoCalificacion: this.codigoResultadoCalificacion
        };
        this.dataService.Encargatura().getDocumentoPublicadoCalificacionEncargatura(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.documentoPublicado = {
                    idDocumentoPublicado: result.idDocumentoPublicado,
                    codigoDocumentoGenerado: result.codigoDocumentoGenerado
                }
            }
            else{
                this.documentoPublicado=null;
            }
        });
    }

    loadPendientes() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso:this.idDesarrolloProceso,
            codigoResultadoCalificacion: this.codigoResultadoCalificacion,
            codigoEstadoCalificacion:EstadoCalificacionEnum.Pendiente
        };
        this.dataService.Encargatura().getTotalesporEstadoyResultado(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result===0) {
                this.tienePendiente=true;
            }
            else{
                this.tienePendiente=false;
            }
        });
    }

    
    loadOrdenMerito() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso:this.idDesarrolloProceso,
            codigoResultadoCalificacion: this.codigoResultadoCalificacion
        };
        this.dataService.Encargatura().getTotalesOrdenMerito(request).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if(result>0){
                this.tieneOrdenMerito=true;
            }
            else{
                this.tieneOrdenMerito=false;
            }
        });
    }

    setDisplayedColumns() {
        if (this.codigoEtapa == EtapaEnum.RatificacionCargo) {
            this.displayedColumns = [
                'rowNum',
                'codigoModular',
                'centroTrabajo',
                'documento',
                'nombreCompleto',
                'codigoPlazaRatificar',
                'cargo',
                'tipoPlaza',
                'estado',
                'conReclamo',
                'acciones'
            ];
        } else {
            this.displayedColumns = [
                'rowNum',
                'codigoModular',
                'centroTrabajo',
                'ordenMerito',
                'documento',
                'nombreCompleto',
                'codigoPlaza',
                'cargo',
                'tipoPlaza',
                'puntajeFinal',
                'estado',
                'conReclamo',
                'sustento',
                'acciones'
            ];
        }
    }

    setRequest() {
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            codigoEtapa: this.codigoEtapa,
            codigoResultadoCalificacion: this.codigoResultadoCalificacion,
            codigoTipoDocumentoIdentidad: null,
            numeroDocumentoIdentidad: null,
            codigoModular: null,
            codigoPlaza: null,
            codigoEstadoCalificacion: null,
            butonAccion:false
        };
    }

    searchCalificacionEncargatura(firstTime: boolean = false) {
        if (firstTime) {
            this.dataSource.load(this.request,(this.paginator.pageIndex + 1), this.paginator.pageSize??this.paginatorPageSize);
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
    }

    handleViewInfo(row: any) {
        this.router.navigate(['../../../../informacioncalificacion/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso+ '/' + row.idCalificacion+ '/' + row.idPostulacion], {
            relativeTo: this.route
        });
    }

    handleViewCriterioCalificacion(row: any) {
        this.router.navigate(['../../../../requisitosycondiciones/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso+ '/' + row.idCalificacion+ '/' + row.idPostulacion], {
            relativeTo: this.route
        });
    }

    handleViewCuadroMeritoCalificacion(row: any) {
        this.router.navigate(['../../../../requisitosycondiciones/' + this.codigoEtapa + '/' + this.idEtapaProceso + '/' + this.idDesarrolloProceso+ '/' + row.idCalificacion+ '/' + row.idPostulacion], {
            relativeTo: this.route
        });
    }

    handleRegisterObservacion(row: any) {
        this.dialogRef = this.materialDialog.open(RegistroObservacionPostulanteEncargaturaComponent, {
            panelClass: 'minedu-registro-observacion-postulante-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idCalificacion: row.idCalificacion,
                codigoEtapa:this.codigoEtapa,
                currentSession:this.currentSession
            }
        });
        this.dialogRef.afterClosed().subscribe(() => {
            this.loadPendientes();
            this.loadDocumentoPublicado();
            this.searchCalificacionEncargatura(true);
        });
    }

    handleViewObservacion(row: any) {
        this.dialogRef = this.materialDialog.open(ObservacionCalificacionEncargaturaComponent, {
            panelClass: 'minedu-observacion-calificacion-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idCalificacion: row.idCalificacion
            }
        });
    }

    handleRegisterReclamo(row: any) {
        this.dialogRef = this.materialDialog.open(RegistroReclamoPostulanteEncargaturaComponent, {
            panelClass: 'minedu-registro-reclamo-postulante-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idCalificacion: row.idCalificacion,
                currentSession:this.currentSession
            }
        });
        this.dialogRef.afterClosed().subscribe(() => {
            this.loadPendientes();
            this.loadDocumentoPublicado();
            this.searchCalificacionEncargatura(true);
        });
    }

    handleViewReclamo(row: any) {
        this.dialogRef = this.materialDialog.open(ReclamoCalificacionEncargaturaComponent, {
            panelClass: 'minedu-reclamo-calificacion-encargatura',
            width: '540px',
            disableClose: true,
            data: {
                idCalificacion: row.idCalificacion
            }
        });
    }

    handleExportar() {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => { });
            return;
        }
        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().exportCalificacionEncargatura(this.request).pipe(catchError(() => of([])), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.export = false;
        })).subscribe((response: any) => {
            if (response) {
                var dateString = formatDate(Date.now(),'yyyy-MM-dd',this.locale);

                var nameFile=(this.codigoResultadoCalificacion==1?"ResultadosPreliminares":"ResultadosFinales");

                saveAs(response, nameFile+dateString+".xlsx", {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"', () => { });
            }
        });
    }

    handleGenerarOrdenMerito() {
        // const tipoResultado = this.codigoResultadoCalificacion == ResultadoCalificacionEnum.ResultadoPreliminar ? "preliminar" : "final";
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso,
            codigoResultadoCalificacion: this.codigoResultadoCalificacion,
            ListadoEstadoCalificacion:[EstadoCalificacionEnum.Apto],
            UsuarioModificacion:this.currentSession.nombreUsuario
        };
        // this.dataService.Message().msgConfirm(`¿ESTÁ SEGURO DE GENERAR ORDEN DE MÉRITO ${tipoResultado}?`, () => {
        this.dataService.Message().msgConfirm(`¿ESTÁ SEGURO DE GENERAR ORDEN DE MÉRITO?`, () => {
            this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Encargatura().orderResultadosCalificacion(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07, 3000,() => { });
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                    }
                    this.loadPendientes();
                    this.loadOrdenMerito();
                    this.searchCalificacionEncargatura(true);
                }
            })
        }, () => { });
    }

    handlePublicarResultadosPreliminar() {

        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso:this.idDesarrolloProceso,
            codigoEtapa:this.codigoEtapa,
            UsuarioModificacion:this.currentSession.nombreUsuario
        };
        this.loading = true;
        this.dataService.Spinner().show('sp6');
        this.dataService.Encargatura().ValidacionesPublicacionPreliminarCalificacion(request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((result: any) => {
            if (result) {
                this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE PUBLICAR EL RESULTADO PRELIMINAR?', () => {
                    // const request = {
                    //     idEtapaProceso: this.idEtapaProceso,
                    //     idDesarrolloProceso: this.idDesarrolloProceso,
                    //     UsuarioModificacion:this.currentSession.nombreUsuario
                    // };
                    // this.loading = true;
                    // this.dataService.Spinner().show('sp6');
                    this.dataService.Encargatura().publishResultadosPreliminarCalificacion(request).pipe(catchError((error) => {
                        this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.loading = false;
                    })).subscribe((result: any) => {
                        if (result !== null) {
                            if (result === true) {
                                this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => { });
                            } else {
                                this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                            }
                            this.loadPendientes();
                            this.loadDocumentoPublicado();
                            this.searchCalificacionEncargatura(true); 
                            this.initializeComponent();
                        }
                    })
                }, () => { });
            }
        });
    }

    handlePublicarResultadosFinales() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso:this.idDesarrolloProceso,
            codigoEtapa:this.codigoEtapa,
            UsuarioModificacion:this.currentSession.nombreUsuario
        };
        this.loading = true;
        this.dataService.Spinner().show('sp6');
        this.dataService.Encargatura().validacionespublicacionfinalCalificacion(request).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this.loading = false;
        })).subscribe((result: any) => {
            if (result) {
                this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE PUBLICAR EL RESULTADO FINAL?', () => {
                    // const request = {
                    //     idEtapaProceso: this.idEtapaProceso,
                    //     idDesarrolloProceso: this.idDesarrolloProceso,
                    //     UsuarioModificacion:this.currentSession.nombreUsuario
                    // };
                    // this.loading = true;
                    // this.dataService.Spinner().show('sp6');
                    this.dataService.Encargatura().publishResultadosFinalCalificacion(request).pipe(catchError((error) => {
                        this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.loading = false;
                    })).subscribe((result: any) => {
                        if (result !== null) {
                            if (result === true) {
                                this.dataService.Message().msgAutoInfo(ENCARGATURA_MESSAGE.M07,3000, () => { });
                            } else {
                                this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN."', () => { });
                            }
                            this.loadPendientes();
                            this.loadDocumentoPublicado();
                            this.searchCalificacionEncargatura(true);
                            this.initializeComponent();
                        }
                    })
                }, () => { });
            }
        });
    }

    handlePreviewDocumento = () => {
        const codigoAdjunto = this.documentoPublicado.codigoDocumentoGenerado;

        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"NO HAY DOCUMENTO."', () => {
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
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO."', () => {
                    });
                }
            });
    };

    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
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

    handleImportarInformeEscalafonario(){

    }
}

export class CalificacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalRegistros = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        this.dataService.Spinner().show("sp6");
        this.dataService.Encargatura().searchCalificacionEncargaturaPaginado(data, pageIndex, pageSize).pipe(catchError((error) => {
            this.dataService.Message().msgWarning('"'+error.error.messages[0].toUpperCase()+'"');
            return of(null);
        }), finalize(() => {
            this.dataService.Spinner().hide("sp6");
            this._loadingChange.next(false);
        })).subscribe((result: any) => {
            console.log(result);
            this._dataChange.next(result || []);
            this.totalRegistros = (result || []).length === 0 ? 0 : result[0].totalRegistros;
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