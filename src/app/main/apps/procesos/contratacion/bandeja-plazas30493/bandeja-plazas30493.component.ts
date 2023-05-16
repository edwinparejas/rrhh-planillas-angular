import {CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { PASSPORT_MESSAGE } from "app/core/model/messages-error";
import { SecurityModel } from "app/core/model/security/security.model";
import { MISSING_TOKEN, ResultadoOperacionEnum } from "app/core/model/types";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { ModalDocumentosPublicadosComponent } from "../components/modal-documentos-publicados/modal-documentos-publicados.component";
import { GrupoDocumentoPublicadoEnum, MensajesSolicitud, SituacionPlazasEnum } from "../_utils/constants";
// import { ControlesActivos } from "../../encargatura/interfaces/encargatura.interface";
import { CodigoCentroTrabajoMaestroEnum } from '../../reasignacion/_utils/constants';
import { plazaBotonesGrillaActivos_30493 } from "../models/contratacion.model";

@Component({
    selector: "minedu-bandeja-plazas30493",
    templateUrl: "./bandeja-plazas30493.component.html",
    styleUrls: ["./bandeja-plazas30493.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPlazas30493Component implements OnInit {

    constructor(private route: ActivatedRoute,
        private dataService: DataService,
        private materialDialog: MatDialog,) {}

    firstTime = true;
    idEtapaProceso: number;
    codSedeCabecera: string;
    routerLinks: any;
    selectionDocentes = new SelectionModel<any>(true, []);
    dataSourcePrepublicadas: PlazasPrepublicadasDataSource | null;
    dataSourceAConvocar: PlazasPrepublicadasDataSource | null;
    dataSourceObservadas: PlazasPrepublicadasDataSource | null;
    dataSourceResultadoFinal: PlazasPrepublicadasDataSource | null;
    paginatorDocentes: any;
    request: any;
    esInicio: boolean = true;
    tituloBandeja:string = "";

    selectTab:any=0;
    dialogRef: any;

    private passport: SecurityModel = new SecurityModel();


    validacionPlaza:string=" PENDIENTE ";  
    controlesActivos:ControlesActivos = {
        btnFinalizarEtapa : true,
        btnAperturaEtapa : true,
        btnIncorporarPlazas: true,
        btnPrePublicarPlazas:true,
        btnPlazaBecarios:true,
        btnVerPlazasPDF:true,
        btnExportar:true,    
        };

    plazaBotonesGrillaActivosPrepublicados:plazaBotonesGrillaActivos_30493;
    plazaBotonesGrillaActivosConvocados:plazaBotonesGrillaActivos_30493;
    plazaBotonesGrillaActivosObservados:plazaBotonesGrillaActivos_30493;
    plazaBotonesGrillaActivosFinal:plazaBotonesGrillaActivos_30493;


    ngOnInit(): void {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.codSedeCabecera = this.passport.codigoSede;
        this.setRequest();
        this.routerLinks = [
            {
            routerLink:['/ayni/personal/procesospersonal/procesos/contratacion'],
            text: "Contratación"
            },
            {
            routerLink:['/ayni/personal/procesospersonal/procesos/contratacion/prepublicacion30493/',this.idEtapaProceso],
            text: "Plazas Pre Publicadas"
            }
        ];
        this.tituloBandeja = " Plazas "
        this.buildDataSource();
        this.inicializarBotonesGrillas();
    }

    inicializarBotonesGrillas(){
        // Prepublicacion
        this.plazaBotonesGrillaActivosPrepublicados = new plazaBotonesGrillaActivos_30493();
        this.plazaBotonesGrillaActivosPrepublicados.btnMigrarPlazasDesiertas=true;
        this.plazaBotonesGrillaActivosPrepublicados.btnIncorporarPlazas=true;
        this.plazaBotonesGrillaActivosPrepublicados.btnPlazasConvocar=true;
        this.plazaBotonesGrillaActivosPrepublicados.btnPlazasObservados=true;
        this.plazaBotonesGrillaActivosPrepublicados.btnExportar=true;

         // A convocar
         this.plazaBotonesGrillaActivosConvocados = new plazaBotonesGrillaActivos_30493();
         this.plazaBotonesGrillaActivosConvocados.btnMigrarPlazasDesiertas=false;
         this.plazaBotonesGrillaActivosConvocados.btnIncorporarPlazas=false;
         this.plazaBotonesGrillaActivosConvocados.btnPlazasConvocar=false;
         this.plazaBotonesGrillaActivosConvocados.btnPlazasObservados=true;
         this.plazaBotonesGrillaActivosConvocados.btnExportar=true;
        
        // Observadas
        this.plazaBotonesGrillaActivosObservados = new plazaBotonesGrillaActivos_30493();
        this.plazaBotonesGrillaActivosObservados.btnMigrarPlazasDesiertas=false;
        this.plazaBotonesGrillaActivosObservados.btnIncorporarPlazas=false;
        this.plazaBotonesGrillaActivosObservados.btnPlazasConvocar=true;
        this.plazaBotonesGrillaActivosObservados.btnPlazasObservados=false;
        this.plazaBotonesGrillaActivosObservados.btnExportar=true;
        
        // Final
        this.plazaBotonesGrillaActivosFinal = new plazaBotonesGrillaActivos_30493();
        this.plazaBotonesGrillaActivosFinal.btnMigrarPlazasDesiertas=false;
        this.plazaBotonesGrillaActivosFinal.btnIncorporarPlazas=false;
        this.plazaBotonesGrillaActivosFinal.btnPlazasConvocar=false;
        this.plazaBotonesGrillaActivosFinal.btnPlazasObservados=false;
        this.plazaBotonesGrillaActivosFinal.btnExportar=true;
    }
    buildDataSource =()=> {
        this.dataSourcePrepublicadas = new PlazasPrepublicadasDataSource(this.dataService);
        this.dataSourceAConvocar = new PlazasPrepublicadasDataSource(this.dataService);
        this.dataSourceObservadas = new PlazasPrepublicadasDataSource(this.dataService);
        this.dataSourceResultadoFinal = new PlazasPrepublicadasDataSource(this.dataService);
   }

    handleSearch = (request: any = null) => {
        if (request == null) {
            this.setRequest();
            request = this.request;
        }
        if (this.request.codigoCentroTrabajoMaestro == null){
            this.request.codigoCentroTrabajoMaestro = this.passport.codigoSede;
        }
        console.log("Index tab seleccionado",this.selectTab, request)
        request.codigoCentroTrabajoMaestro = this.codSedeCabecera;
        switch(this.selectTab){
            case 0: request.idSituacionValidacion = SituacionPlazasEnum.PRE_PUBLICADA;
                    this.request = request;
                    this.buscarPlazasPrepublicadas(this.request);
            break; 
            case 1: request.idSituacionValidacion = SituacionPlazasEnum.A_CONVOCAR;
                    this.request = request;
                    this.buscarPlazasAConvocar(this.request);
            break;  
            case 2: request.idSituacionValidacion = SituacionPlazasEnum.OBSERVADA;
                    this.request = request;
                    this.buscarPlazasObservadas(this.request);
            break;
            case 3: request.idSituacionValidacion = SituacionPlazasEnum.PUBLICADO //  SituacionPlazasEnum.A_CONVOCAR;;
                    this.request = request;
                    this.buscarPlazasResultadoFinal(this.request);
            break;  
        }
        // this.buscarPlazasPrepublicadas(this.request);
    };

    handPaginator = (paginator: any) => {
        if (!this.paginatorDocentes) {
            this.paginatorDocentes = paginator;
        } else {
            this.paginatorDocentes = paginator;
            this.buscarPlazasPrepublicadas(this.request);
        }
    };

    private buscarPlazasPrepublicadas = (request: any) => {
        this.selectionDocentes = new SelectionModel<any>(true, []);
        this.dataSourcePrepublicadas.load(
            request,
            this.paginatorDocentes.pageIndex + 1,
            this.paginatorDocentes.pageSize,
            this.firstTime
        );
    };

    private buscarPlazasAConvocar = (request: any) => {
        this.selectionDocentes = new SelectionModel<any>(true, []);
        this.dataSourceAConvocar.load(
            request,
            this.paginatorDocentes.pageIndex + 1,
            this.paginatorDocentes.pageSize,
            this.firstTime
        );
    };

    private buscarPlazasObservadas = (request: any) => {
        this.selectionDocentes = new SelectionModel<any>(true, []);
        this.dataSourceObservadas.load(
            request,
            this.paginatorDocentes.pageIndex + 1,
            this.paginatorDocentes.pageSize,
            this.firstTime
        );
    };

    private buscarPlazasResultadoFinal = (request: any) => {
        this.selectionDocentes = new SelectionModel<any>(true, []);
        this.dataSourceResultadoFinal.load(
            request,
            this.paginatorDocentes.pageIndex + 1,
            this.paginatorDocentes.pageSize,
            this.firstTime
        );
    };

    setRequest() {
         this.passport = this.dataService.Storage().getInformacionUsuario();
        // const formulario = this.form.getRawValue();
        // let codigoPlaza = formulario.codigoPlaza ? formulario.codigoPlaza : null;
        // let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        // let codigoCentroTrabajo = formulario.codigoCentroTrabajo ? formulario.codigoCentroTrabajo : null;
        // let idSituacionValidacion = 0;

        // switch (this.selectTab) {
        //     case this.selectTabId.PlazasDesiertas:
        //         idSituacionValidacion = SituacionPlazasEnum.PRE_PUBLICADA;
        //         break;
        //     case this.selectTabId.PlazasConvocar:
        //         idSituacionValidacion = SituacionPlazasEnum.A_CONVOCAR;
        //         break;
        //     case this.selectTabId.PlazasObservadas:
        //         idSituacionValidacion = SituacionPlazasEnum.OBSERVADA;
        //         break;
        //     case this.selectTabId.PlazasResultadoFinal:
        //         idSituacionValidacion = SituacionPlazasEnum.PUBLICADO;
        //         break;
        // }
        console.log("ingresandoReques", this.idEtapaProceso, this.codSedeCabecera, this.passport.codigoSede)
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            codigoPlaza: null,// codigoPlaza: codigoPlaza,
            idCentroTrabajo:null,// idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo:null,// codigoCentroTrabajo: codigoCentroTrabajo,
            //idSituacionValidacion:SituacionPlazasEnum.PRE_PUBLICADA,// idSituacionValidacion: idSituacionValidacion,
            codigoCentroTrabajoMaestro:this.codSedeCabecera==null?this.passport.codigoSede:this.codSedeCabecera,
            usuarioModificacion:this.passport.numeroDocumento,
        };
        console.log("termino de incorporar", this.request)
    }

    handlePublicarPlazas = ($event) => {
        this.selectTab = 1;
        this.handleSearch(this.request);
        if (this.dataSourceAConvocar.data.length == 0) {
            this.dataService.Message().msgAutoCloseWarningNoButton('NO TIENE PLAZAS CONVOCADAS PARA PUBLICAR.', 3000, () => { });
            return;
        }

        /*
        this.selectTab = 0;
        this.handleSearch(this.request);
        if (this.dataSourcePrepublicadas.data.length > 0) {
            this.dataService.Message().msgAutoCloseWarningNoButton('NO HA TERMINADO DE MOVER TODAS LAS PLAZAS.', 3000,  () => { });
            return;
        }
        */

        this.dataService.Message().msgConfirm(
            '¿ESTA SEGURO QUE DESEA PUBLICAR LAS PLAZAS INCORPORADAS?',
            () => {
                this.dataService.Spinner().show("sp6");
                let d = {
                    idEtapaProceso: this.idEtapaProceso,
                    usuarioModificacion: this.passport.numeroDocumento,
                    codigoCentroTrabajoMaestro: this.passport.codigoSede,
                };
                this.dataService.Contrataciones().putPublicarPlazasContratacionEvalExp(d).pipe(
                    catchError((e) => of([e])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    /*if (result > 0) {
                        this.dataService.Message().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA", () => {});
                        this.dataSourceMemoryIncorporadas = [];
                        this.handleBuscar();
                        this.obtenerPlazaContratacion();
                    } else {
                        this.dataService.Message().msgWarning("OCURRIÓ UN PROBLEMA AL TRATAR DE FINALIZAR LA VALIDACIÓN.")
                    }  */
                    if (response > 0) {
                        this.dataService.Message().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA", () => {});
                        // this.dataSourceMemoryIncorporadas = [];
                        // this.obtenerPlazaContratacion();
                        this.selectTab = 3;
                        this.handleSearch(this.request);
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
                    }                      
                });
            }
        );    
    };

    handleAperturarPlaza = ($event) => {
        let d = {
            idEtapaProceso: this.idEtapaProceso,
            usuarioModificacion: this.passport.numeroDocumento,
            codigoCentroTrabajoMaestro : this.codSedeCabecera
        }
        this.dataService.Message().msgConfirm('¿Está seguro de aperturar plaza?', () => {
            this.dataService.Spinner().show("sp6");
            this.setRequest();
            this.dataService.Contrataciones().putAperturarPlazasContratacionEvalExp(d).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message().msgSuccess(MensajesSolicitud.M07, () => {});
                        // this.obtenerPlazaContratacion();
                        this.selectTab = 0;
                        this.handleSearch(this.request);
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
                    }
                });
        }, () => {});
    }
    
    handleVerListadoPlazas($event){
        this.dataService.Spinner().show("sp6");
        this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent,
            {
                panelClass: "modal-documentos-publicados-dialog",
                width: "400px",
                disableClose: true,
                data: {
                    idEtapaProceso: this.idEtapaProceso,
                    idGrupoDocumento: GrupoDocumentoPublicadoEnum.PLAZAS
                },
            }
        );
    }
}

export class PlazasPrepublicadasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime = false): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            if(data.idSituacionValidacion){
                this.dataService
                .Contrataciones()
                .getBuscarPlazasPaginadoEvalExp(data, pageIndex, pageSize)
                .pipe(
                    catchError((e) => of([e])),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response) {
                        this._dataChange.next(response || []);
                        this.totalregistro =
                            (response || []).length === 0
                                ? 0
                                : response[0].total_registros;
                    } else {
                        let r = response[0];
                        /*if (r.status == ResultadoOperacionEnum.InternalServerError) {
                        this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                    } else if (r.status == ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(r.message, () => { });
                    } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                    } else {
                        this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                    }*/
                    }
                });
            }
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

    eventsSubject: Subject<void> = new Subject<void>();

    emitEventToChild() {
    this.eventsSubject.next();
    }
}


interface ControlesActivos{
    btnFinalizarEtapa : boolean,
    btnAperturaEtapa : boolean,
    btnIncorporarPlazas: boolean,
    btnPrePublicarPlazas:boolean,
    btnPlazaBecarios:boolean,
    btnVerPlazasPDF:boolean,
    btnExportar:boolean,
}