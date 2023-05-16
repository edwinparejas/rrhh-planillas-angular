import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { SharedService } from "../../../../../../core/shared/shared.service";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import {
    CatalogoItemEnum,
    EstadoCalificacionEnum,
    EstadoPostulante,
    GrupoDocumentoPublicadoEnum,
    ResultadoCalificacionEnum,
    TipoDocumentoIdentidadEnum,
	TipoAccionEnum,
	FlujoEstadoEnum,
    MensajesSolicitud,
} from "../../_utils/constants";
import { BuscadorServidorPublicoComponent } from "../../components/buscador-servidor-publico/buscador-servidor-publico.component";
import {
    IAprobarPostulanteContratacionDirecta,
    IEliminarPostulanteContratacionDirecta,
} from "../../models/contratacion.model";
import { descargarExcel } from "app/core/utility/functions";
import { MISSING_TOKEN } from "../../../rotacion/_utils/constants";
import { PASSPORT_MESSAGE } from "../../../../../../core/model/message";
import { ResultadoOperacionEnum } from "../../../../bandejas/actividades/gestion-pendientes/_utils/constants";
import {
    CONFIGURACION_PROCESO_MESSAGE,
    SNACKBAR_BUTTON,
} from "app/core/model/messages-error";
import { ModalObservarPostulanteComponent } from "./modal-observar-postulante/modal-observar-postulante.component";
import { ModalVerObservacionComponent } from "./modal-ver-observacion/modal-ver-observacion.component";
import { ModalRegistrarReclamoComponent } from "./modal-registrar-reclamo/modal-registrar-reclamo.component";
import { ModalVerReclamoComponent } from "./modal-ver-reclamo/modal-ver-reclamo.component";
import { ModalDocumentosPublicadosComponent } from "../../components/modal-documentos-publicados/modal-documentos-publicados.component";
import { SecurityModel } from "app/core/model/security/security.model";
import { modalPostulante } from '../../models/modalPostulante';
import { bandejaCalificacionModel } from '../../models/bandejaCalificacion.model';

@Component({
    selector: "minedu-bandeja-calificaciones",
    templateUrl: "./bandeja-calificaciones.component.html",
    styleUrls: ["./bandeja-calificaciones.component.scss"],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class BandejaCalificacionesComponent implements OnInit {
    firstTime = true;
    maxLengthnumeroDocumentoIdentidad: number;
    form: FormGroup;
    idEtapaProceso: number;
    codigoSede: any;
    
    estadoDesarrolloCalificacion:any;
    estadoCalificacionOrdenMerito:any;
    estadoCalificacionObservados:any;
    estadoDesarrollo:any;
    estadoCalificacionDirecta:any;
    sumaCalificacionOrdenMerito:any;
    cantidadCalificacionObservados:any;
    cantidadCalificacionNoPendientes:any;
    cantidadCalificacionPendientes:any;
    calificacionPublicadoFinal:any;
    finPostulacionAprobados:boolean;

    dialogRef: any;
    estado: string;
    becario: string;
    isMobile = false;
    tipoDocumentos: any[] = [];
    estados: any[] = [];
    idServidorPublicoSelected: number;
    paginatorResultadoPreliminarPageIndex = 0;
    paginatorResultadoPreliminarPageSize = 10;
    paginatorResultadoFinalPageIndex = 0;
    paginatorResultadoFinalPageSize = 10;
    estadoCalificacion = EstadoCalificacionEnum;
    ResultadoCalificacionEnum = ResultadoCalificacionEnum;
    GrupoDocumentoPublicadoEnum = GrupoDocumentoPublicadoEnum;
    requestAprobar: IAprobarPostulanteContratacionDirecta | null;
    requestEliminar: IEliminarPostulanteContratacionDirecta | null;
    @ViewChild("paginatorResultadoPreliminar", { static: true })
    paginatorResultadoPreliminar: MatPaginator;
    dataSourceResultadoPreliminar: PlazasContratacionResultadoPreliminarDataSource | null;
    @ViewChild("paginatorResultadoFinal", { static: true })
    paginatorResultadoFinal: MatPaginator;
    dataSourceResultadoFinal: PlazasContratacionResultadoFinalDataSource | null;
    displayedColumnsResultadoPreliminar: string[] = [
        "registro",
        "documento",
        "apellidos_nombres",
        "numero_expediente",
        "codigo_plaza",
        "cargo",
        "centro_trabajo",
        // "modalidad_educativa",
        "nivel_educativo",
        "estado",
        "con_reclamo",
        "acciones",
    ];

    displayedColumnsResultadoFinal: string[] = [
        "registro",
        "documento",
        "apellidos_nombres",
        "numero_expediente",
        "codigo_plaza",
        "cargo",
        "centro_trabajo",
        // "modalidad_educativa",
        "nivel_educativo",
        "estado",
        "con_reclamo",
        "acciones",
    ];

    request = {
        idEtapaProceso: null,
        idTipoDocumento: null,
        numeroDocumento: null,
        numeroExpediente: null,
        idEstado: null,
        idResultadoCalificacion: null,
        usuarioCreacion: null,
        codigoCentroTrabajoMaestro: null,
	idFlujoEstado: null
    };

    selectTab = 0;
    selectTabId = {
        ResultadoPreliminar: 0,
        ResultadoFinal: 1,
    };
    currentSession: SecurityModel = new SecurityModel();
    modalPostulante:modalPostulante = new modalPostulante();
    bandejaCalificacion:bandejaCalificacionModel = new bandejaCalificacionModel();
    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = +this.route.snapshot.params.id;
        this.buildForm();
        this.buildGrids();
        this.iniCombos();
        this.obtenerEstadoCalificacion();
        this.handleResponsive();

        this.buildSeguridadControles();
        this.currentSession = this.dataService
            .Storage()
            .getInformacionUsuario();
        this.codigoSede = this.currentSession.codigoSede;

        this.obtenerEstadoDesarrolloEtapa();    
	this.obtenerFlujoEstado();
    }

    
    obtenerEstadoDesarrolloEtapa = () => {
        let idProcesoEtapa = +this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;

        this.dataService .Contrataciones()
            .obtenerCabeceraEstadoDesarrolloEtapaProceso(idProcesoEtapa, codSede)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                // console.log("Resultados de Calificacion: ",response);
                if (response) {
                    this.estadoDesarrollo = response.estadoDesarrollo;
                    this.estadoDesarrolloCalificacion = response.estadoDesarrollo;
                    /*this.estadoCalificacionOrdenMerito = response.estadoCalificacionOrdenMerito;
                    this.estadoCalificacionObservados = response.estadoCalificacionObservados*/
                    this.estadoCalificacionDirecta = response.estadoDesarrolloCalificacion;
                    this.sumaCalificacionOrdenMerito = response.sumaCalificacionOrdenMerito;
                    this.cantidadCalificacionObservados = response.cantidadCalificacionObservados; 
                    this.cantidadCalificacionNoPendientes = response.cantidadCalificacionNoPendientes; 
                    this.cantidadCalificacionPendientes = response.cantidadCalificacionPendientes; 
                    this.calificacionPublicadoFinal = response.calificacionPublicadoFinal;
		    this.finPostulacionAprobados = response.finPostulacionAprobados; 
                }
            // console.log("Estado de desarrollo : ", this.estadoDesarrolloCalificacion);
            console.log("Estado de desarrollo Returb completo: ", response);
            console.log("Estado de desarrollo y otros : ", this.estadoDesarrollo, this.estadoCalificacionDirecta, this.estadoDesarrolloCalificacion, this.sumaCalificacionOrdenMerito, this.cantidadCalificacionObservados, this.cantidadCalificacionNoPendientes, this.cantidadCalificacionPendientes);
            
            });
    };
    ngAfterViewInit() {
        this.paginatorResultadoPreliminar.page
            .pipe(tap(() => this.handleBuscarPaginator()))
            .subscribe();
        this.paginatorResultadoFinal.page
            .pipe(tap(() => this.handleBuscarPaginator()))
            .subscribe();
    }

    iniCombos(): void {
        this.getEstados();
        this.getDocumentoTipos();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            tipoDocumento: [null],
            numeroDocumentoIdentidad: [null],
            numeroExpediente: [null],
            estado: [null],
        });

        setTimeout((_) => this.handleBuscar());

        this.form.get('numeroDocumentoIdentidad').disable();
    }

    activarCampoNroDocumento(){
	this.maxLengthnumeroDocumentoIdentidad = this.form.get('tipoDocumento').value == 11 ? 8 : 12;
	this.form.get('numeroDocumentoIdentidad').setValue(null);
        if(this.form.get('tipoDocumento').value != null)
            this.form.get('numeroDocumentoIdentidad').enable();
        else
            this.form.get('numeroDocumentoIdentidad').disable();

    }
    // // TODO : CLEAN HARDCODE
    // buildSeguridadControles = (codigoRol:string) => {
    //     switch(codigoRol){
    //         case "AYNI_006": { this.controlesActivos = { btnFinalizarValidacionPlazas:false, btnPublicarPlazas:false, btnAperturarPublicacion:false, btnIncorporarPlazas: false, btnPlazasConvocar:false, btnPlazasObservadas:false, btnVerPlazasPDF:true, btnExportar:true, btnEliminarPlazas:false }; break;}
    //         case "AYNI_019": { this.controlesActivos = { btnFinalizarValidacionPlazas:false, btnPublicarPlazas:false, btnAperturarPublicacion:true, btnIncorporarPlazas: false, btnPlazasConvocar:false, btnPlazasObservadas:false, btnVerPlazasPDF:true, btnExportar:true, btnEliminarPlazas:false }; break;}
    //         case "AYNI_004": { this.controlesActivos = { btnFinalizarValidacionPlazas:true, btnPublicarPlazas:true, btnAperturarPublicacion:false, btnIncorporarPlazas: true, btnPlazasConvocar:true, btnPlazasObservadas:true, btnVerPlazasPDF:true, btnExportar:true, btnEliminarPlazas:true }; break;}
    //         case "AYNI_030": { this.controlesActivos = { btnFinalizarValidacionPlazas:false, btnPublicarPlazas:false, btnAperturarPublicacion:false, btnIncorporarPlazas: false, btnPlazasConvocar:false, btnPlazasObservadas:false, btnVerPlazasPDF:true, btnExportar:true, btnEliminarPlazas:false }; break;}
    //     }
    //     console.log("ControlesActivos: ", this.controlesActivos," - ", codigoRol , " - ", this.soloLectura);
    // }

    // TODO : CLEAN HARDCODE

    controlesActivos: ControlesActivosCalificacion = {
        btnCargaMassiva: false,
        btnGenerarOrdenMerito: false,
        btnObservarPostulante: false,
        btnPublicarCuadroMeritoFinal: false,
        btnPublicarCuadroMeritoPreliminar: false,
        btnPublicarResultadoFinal: false,
        btnPublicarResultadoPreliminar: false,
        btnRealizarCalificacion: false,
        btnRegistrarReclamo: false,
    };
    buildSeguridadControles = () => {
        const rol = this.dataService.Storage().getPassportRolSelected();
        // Ajustar Valores
        this.currentSession.idRol = 0;
        switch (rol.CODIGO_TIPO_SEDE) {
            case "TS001":
                this.currentSession.idTipoSede = 2;
                if (rol.CODIGO_ROL == "AYNI_004") this.currentSession.idRol = 5; // Resp. DRE
                break;
            case "TS002":
                this.currentSession.idTipoSede = 3;
                if (rol.CODIGO_ROL == "AYNI_004") this.currentSession.idRol = 6; // Resp UGEL
                break;
            case "TS004":
                this.currentSession.idTipoSede = 4;
                if (rol.CODIGO_ROL == "AYNI_004") this.currentSession.idRol = 7; // Resp. IE Militar
                break;
            case "TS005":
                this.currentSession.idTipoSede = 1;
                if (rol.CODIGO_ROL == "AYNI_006") this.currentSession.idRol = 2; // Esp Diten
                if (rol.CODIGO_ROL == "AYNI_004") this.currentSession.idRol = 5; // Resp. DRE
                break;
            case "TS013":
                this.currentSession.idTipoSede = 1;
                if (rol.CODIGO_ROL == "AYNI_019") this.currentSession.idRol = 9; // Esp Diten
                break;
            default: // Monitor
                if (rol.CODIGO_ROL == "AYNI_006") this.currentSession.idRol = 2;
                break;
        }

        const data = {
            idEtapaProceso: this.idEtapaProceso,
            idTipoSede: this.currentSession.idTipoSede,
            idRol: this.currentSession.idRol,
        };

        console.log("Datos entrada seguridad: ", data);
        this.dataService
            .Contrataciones()
            .getObtenerAccesoUsuariosCalificaciones(data)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log("Valores de tabla accesos: ", response);
                    this.controlesActivos = {
                        btnCargaMassiva: response.cargaMasiva,
                        btnGenerarOrdenMerito: response.generarOrdenMerito,
                        btnObservarPostulante: response.observarPostulante,
                        btnPublicarCuadroMeritoFinal:
                            response.publicarCuadroMeritoFinal,
                        btnPublicarCuadroMeritoPreliminar:
                            response.publicarCuadroMeritoPreliminar,
                        btnPublicarResultadoFinal:
                            response.publicarResultadoFinal,
                        btnPublicarResultadoPreliminar:
                            response.publicarResultadoPreliminar,
                        btnRealizarCalificacion: response.realizarCalificacion,
                        btnRegistrarReclamo: response.registrarReclamo,
                    };
                    console.log(this.controlesActivos);
                }
            });
    };

    buildGrids(): void {
        this.dataSourceResultadoPreliminar =
            new PlazasContratacionResultadoPreliminarDataSource(
                this.dataService
            );
        this.dataSourceResultadoFinal =
            new PlazasContratacionResultadoFinalDataSource(this.dataService);
        this.buildPaginators(this.paginatorResultadoPreliminar);
        this.buildPaginators(this.paginatorResultadoFinal);
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = (
            page: number,
            pageSize: number,
            length: number
        ) => {
            if (length === 0 || pageSize === 0) {
                return `0 de ${length}`;
            }
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex =
                startIndex < length2
                    ? Math.min(startIndex + pageSize, length2)
                    : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        };
    }

    getEstados() {
        this.dataService
            .Contrataciones()
            .getComboTipoDocumentos(CatalogoItemEnum.ESTADO_CALIFICACION)
            .pipe(
                catchError(() => {
                    this.dataService
                        .SnackBar()
                        .msgError(
                            CONFIGURACION_PROCESO_MESSAGE.ESTADOS_POSTULANTE,
                            SNACKBAR_BUTTON.CLOSE
                        );
                    return of(null);
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.estados = response;
		    this.form.get('estado').setValue('-1');
                } else {
                    this.dataService
                        .SnackBar()
                        .msgError(
                            CONFIGURACION_PROCESO_MESSAGE.ESTADOS_POSTULANTE,
                            SNACKBAR_BUTTON.CLOSE
                        );
                    this.estados = [];
                }
            });
    }

    getDocumentoTipos() {
        this.dataService
            .Contrataciones()
            .getComboTipoDocumentos(CatalogoItemEnum.TIPOS_DOCUMENTOS_IDENTIDAD)
            .pipe(
                catchError(() => {
                    this.dataService
                        .SnackBar()
                        .msgError(
                            CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD,
                            SNACKBAR_BUTTON.CLOSE
                        );
                    return of(null);
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.tipoDocumentos = response;
		    this.form.get('tipoDocumento').setValue('-1');
                } else {
                    this.dataService
                        .SnackBar()
                        .msgError(
                            CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD,
                            SNACKBAR_BUTTON.CLOSE
                        );
                    this.tipoDocumentos = [];
                }
            });
    }

    busquedaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(
            BuscadorServidorPublicoComponent,
            {
                panelClass: "minedu-buscador-servidor-publico-dialog",
                width: "980px",
                disableClose: true,
                data: {
                    action: "busqueda",
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const servidorPublico = resp.servidorPublico;
                this.idServidorPublicoSelected =
                    servidorPublico.idServidorPublico;
                this.form
                    .get("tipoDocumento")
                    .setValue(servidorPublico.idTipoDocumentoIdentidad);
                this.form
                    .get("numeroDocumentoIdentidad")
                    .setValue(servidorPublico.numeroDocumentoIdentidad);
            }
        });
    }

    obtenerEstadoCalificacion(): void {
        let d = {
            idEtapaProceso: this.idEtapaProceso,
        };

        this.dataService
            .Contrataciones()
            .obtenerCalificacionPorIdEtapaProceso(d)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response.length > 0) {
                    this.estado = response[0].estado_calificacion;
                }
            });
    }

    handleBuscarPaginator = () => {
        // if (this.selectTab == this.selectTabId.ResultadoPreliminar) {
        //     this.buscarResultadoPreliminar();
        // } else {
        //     this.buscarResultadoFinal();
        // }

        if(this.firstTime) 
        {
            this.buscarResultadoPreliminar();
            this.buscarResultadoFinal();
        }
        else{
            if (this.selectTab == this.selectTabId.ResultadoPreliminar) {
                this.buscarResultadoPreliminar();
            }
            if (this.selectTab == this.selectTabId.ResultadoFinal) {
                this.buscarResultadoFinal();
            }
        }
        this.firstTime = false;
    }

    handleBuscar = () => {
        this.paginatorResultadoFinal.firstPage();
        this.paginatorResultadoPreliminar.firstPage();
        this.handleBuscarPaginator();
        this.firstTime = false;

    };

    handleSelectTab = (e) => {
	this.firstTime = true;
	this.paginatorResultadoFinal.firstPage();
	this.paginatorResultadoPreliminar.firstPage();
	this.handleBuscarPaginator();
    };

    cargarFiltros() {
        this.request = this.form.getRawValue();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        this.request.idEtapaProceso = this.idEtapaProceso;
        this.request.codigoCentroTrabajoMaestro = this.currentSession.codigoSede;
	this.request.idTipoDocumento = this.request['tipoDocumento']=='-1'?null:this.request['tipoDocumento'];
	this.request.numeroDocumento = this.request['numeroDocumentoIdentidad'];
	this.request.numeroExpediente = this.request['numeroExpediente']==''?null:this.request['numeroExpediente'];
	this.request.idEstado = this.request['estado']=='-1'?null:this.request['estado'];
    }

    buscarResultadoPreliminar() {
        this.cargarFiltros();
        this.request.idEtapaProceso = this.idEtapaProceso;
        this.request.idResultadoCalificacion =
            ResultadoCalificacionEnum.PRELIMINAR;

	if(this.request['numeroDocumentoIdentidad'] != null && this.request['tipoDocumento'] != null){
	    let validacionDocumento = this.modalPostulante.validarDocumento(this.request['numeroDocumentoIdentidad'], this.request['tipoDocumento']);
	    if (!validacionDocumento.esValido) {
		this.dataService.Message().msgWarning(validacionDocumento.mensaje);
		return;
	    }
	}

        this.dataSourceResultadoPreliminar.load(
            this.request,
            this.paginatorResultadoPreliminar.pageIndex + 1,
            this.paginatorResultadoPreliminar.pageSize,
	        this.firstTime
        );
    }

    buscarResultadoFinal() {
        this.cargarFiltros();
        this.request.idEtapaProceso = this.idEtapaProceso;
        this.request.idResultadoCalificacion = ResultadoCalificacionEnum.FINAL;

	if(this.request['numeroDocumentoIdentidad'] != null && this.request['tipoDocumento'] != null){
	    let validacionDocumento = this.modalPostulante.validarDocumento(this.request['numeroDocumentoIdentidad'], this.request['tipoDocumento']);
	    if (!validacionDocumento.esValido) {
		this.dataService.Message().msgWarning(validacionDocumento.mensaje);
		return;
	    }
	}
        this.dataSourceResultadoFinal.load(
            this.request,
            this.paginatorResultadoFinal.pageIndex + 1,
            this.paginatorResultadoFinal.pageSize,
	    this.firstTime
        );
    }

    handleRequisitos = (data) => {
        this.router.navigate(
            [
                "./requisitos-calificacion/" +
                    data.id_calificacion +
                    "/" +
                    data.id_persona +
                    "/" +
                    data.codigo_plaza,
            ],
            {
                relativeTo: this.route,
            }
        );
    };

    handleObservar = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(
            ModalObservarPostulanteComponent,
            {
                panelClass: "modal-observar-postulante-dialog",
                width: "600px",
                disableClose: true,
                data: dataPostulante,
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });
    };

    handleVerObservacion = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(
            ModalVerObservacionComponent,
            {
                panelClass: "modal-ver-observacion-dialog",
                width: "600px",
                disableClose: true,
                data: dataPostulante,
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });
    };

    handleRegistrarReclamo = (dataPostulante) => {
      let data = {
        ...dataPostulante,
        idFlujoEstado: this.bandejaCalificacion.getIdFlujoEstado()
      };
        this.dialogRef = this.materialDialog.open(
            ModalRegistrarReclamoComponent,
            {
                panelClass: "modal-registrar-reclamo-dialog",
                width: "600px",
                disableClose: true,
                data: data,
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });
    };

    handleVerInformacion = (data) => {
        this.router.navigate(
            [
                "./informacion-completa/" +
                    data.id_calificacion +
                    "/" +
                    data.id_persona +
                    "/" +
                    data.codigo_plaza,
            ],
            {
                relativeTo: this.route,
            }
        );
    };

    handleVerReclamo = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalVerReclamoComponent, {
            panelClass: "modal-ver-reclamo-dialog",
            width: "600px",
            disableClose: true,
            data: dataPostulante,
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });
    };

    handlePublicarResultado = (idResultadoCalificacion) => {
        let nombreResultado = "";

        if (idResultadoCalificacion == ResultadoCalificacionEnum.PRELIMINAR) {
            if (this.dataSourceResultadoPreliminar.data.length === 0) {
                this.dataService
                    .Message()
                    .msgWarning(
                        '"NO SE ENCONTRÓ INFORMACIÓN PARA PUBLICAR RESULTADO."'
                    );
                return;
            }

	    this.cargarFiltros();
	    this.request.idEtapaProceso = this.idEtapaProceso;
	    this.request.idResultadoCalificacion = idResultadoCalificacion;
	    this.request.idFlujoEstado = this.bandejaCalificacion.getIdFlujoEstado();

	    this.dataService
		.Contrataciones()
		.veficarCalificacionesPendientes(this.request)
		.subscribe(response => {
		    if(response){
			return this.dataService
			    .Message()
			    .msgWarning(
				'"UNO O MÁS POSTULANTES SE ENCUENTRAN PEDIENTES DE REVISAR LOS REQUISITOS E IMPEDIMENTOS"'
			    );
		    }
                    nombreResultado = "PRELIMINARES";
		    this.publicarResultadosCalificacion(
			idResultadoCalificacion,
			nombreResultado
		    );
		});
        } else {
            if (this.dataSourceResultadoFinal.data.length === 0) {
                this.dataService
                    .Message()
                    .msgWarning(
                        '"NO SE ENCONTRÓ INFORMACIÓN PARA PUBLICAR RESULTADO."'
                    );
                return;
            }

	    this.dataService
		.Contrataciones()
		.veficarExisteReclamo(this.request)
		.subscribe(response => {
		    if(response){
			return this.dataService
			    .Message()
			    .msgWarning(
				'"UNO O MÁS POSTULANTES SE ENCUENTRAN CON RECLAMO."'
			    );
		    }
		    nombreResultado = "FINALES";
		    this.publicarResultadosCalificacion(
			idResultadoCalificacion,
			nombreResultado
		    );
		});
        }
    };

    publicarResultadosCalificacion = (
        idResultadoCalificacion,
        nombreResultado
    ) => {
        this.cargarFiltros();
        this.request.idEtapaProceso = this.idEtapaProceso;
        this.request.idResultadoCalificacion = idResultadoCalificacion;
        this.request.usuarioCreacion = this.currentSession.numeroDocumento;
	this.request.idFlujoEstado = this.bandejaCalificacion.getIdFlujoEstado();

        this.dataService.Message().msgConfirm(
            `¿ESTÁ SEGURO QUE DESEA PUBLICAR LOS RESULTADOS ${nombreResultado}?`,
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Contrataciones()
                    .generarPdfContratacionResultadosCalificaciones(
                        this.request
                    )
                    .pipe(
                        catchError(() => of([])),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response: any) => {
                        if (response.file) {
                            //if (nombreResultado == "FINAL")
                                //this.publicarResultadoFinalAdjudicacion();
                            //else this.publicarResultadoPreliminarAdjudicacion();
			    this.obtenerEstadoDesarrolloEtapa();
                            this.handleBuscar();
			    this.obtenerFlujoEstado();
                        } else {
                            this.dataService
                                .Message()
                                .msgWarning(
                                    '"NO SE REALIZÓ CORRECTAMENTE LA PUBLICACIÓN DE RESULTADOS."',
                                    () => {}
                                );
                        }
                    });
            },
            () => {}
        );
    };

    publicarResultadoFinalAdjudicacion = () => {
        let request = {
            idEtapaProceso: this.idEtapaProceso,
            usuarioModificacion: this.currentSession.numeroDocumento,
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
	    idFlujoEstado: this.bandejaCalificacion.getIdFlujoEstado()
        };

        this.dataService.Spinner().show("sp6");
        this.dataService
            .Contrataciones()
            .postPublicarFinalCalificacion(request)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response > -1) {
                    this.dataService
                        .Message()
                        .msgSuccess(
                            '"SE PUBLICARON CORRECTAMENTE LA CALIFICACIÓN DE LOS POSTULANTES."',
                            () => {}
                        );
                } else {
                    let r = response[0];
                    if (
                        r.status == ResultadoOperacionEnum.InternalServerError
                    ) {
                        this.dataService
                            .Message()
                            .msgWarning(r.error.developerMessage, () => {});
                    } else if (r.status == ResultadoOperacionEnum.NotFound) {
                        this.dataService
                            .Message()
                            .msgWarning(r.message, () => {});
                    } else if (
                        r.status == 401 ||
                        r.error == MISSING_TOKEN.INVALID_TOKEN
                    ) {
                        this.dataService
                            .Message()
                            .msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                                this.dataService.Storage().passportUILogin();
                            });
                    } else {
                        this.dataService
                            .Message()
                            .msgError(MensajesSolicitud.ERROR, () => {});
                    }
                }
            });
    };
    publicarResultadoPreliminarAdjudicacion = () => {
        let request = {
            idEtapaProceso: this.idEtapaProceso,
            usuarioModificacion: this.currentSession.numeroDocumento,
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
	    idFlujoEstado: this.bandejaCalificacion.getIdFlujoEstado()
        };

        console.log("Datos para prePublicar:",request);

        this.dataService.Spinner().show("sp6");
        this.dataService
            .Contrataciones()
            .postPublicarPreliminarCalificacion(request)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response > -1) {
                    this.dataService
                        .Message()
                        .msgSuccess(
                            '"SE PUBLICARON CORRECTAMENTE LA CALIFICACIÓN DE LOS POSTULANTES."',
                            () => {}
                        );
                } else {
                    let r = response[0];
                    if (
                        r.status == ResultadoOperacionEnum.InternalServerError
                    ) {
                        this.dataService
                            .Message()
                            .msgWarning(r.error.developerMessage, () => {});
                    } else if (r.status == ResultadoOperacionEnum.NotFound) {
                        this.dataService
                            .Message()
                            .msgWarning(r.message, () => {});
                    } else if (
                        r.status == 401 ||
                        r.error == MISSING_TOKEN.INVALID_TOKEN
                    ) {
                        this.dataService
                            .Message()
                            .msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                                this.dataService.Storage().passportUILogin();
                            });
                    } else {
                        this.dataService
                            .Message()
                            .msgError(MensajesSolicitud.ERROR, () => {});
                    }
                }
            });
    };

    handleVerResultado = (grupoDocumento) => {
        this.dialogRef = this.materialDialog.open(
            ModalDocumentosPublicadosComponent,
            {
                panelClass: "minedu-modal-documentos-publicados",
                disableClose: true,
                data: {
                    idEtapaProceso: this.idEtapaProceso,
                    idGrupoDocumento: grupoDocumento,
                    codigoCentroTrabajoMaestro : this.currentSession.codigoSede,
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    };

    handleExportarResultado = (idResultadoCalificacion) => {
        let nombre_excel = "";

         // ************************************************************************************************
         let fechaActual = new Date();
         var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                     .toISOString()
                     .split("T")[0];
         var nombreExcel = "Calificacion_Docentes_";
         try{
             var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
         }catch{
             var nombreExportar:string = nombreExcel+ ".xlsx";
         }

         dateString = dateString + ".xlsx"
         // ************************************************************************************************

        if (idResultadoCalificacion == ResultadoCalificacionEnum.PRELIMINAR) {
            nombre_excel += "Resultado_Calificacion_Preliminar-"+dateString+".xlsx";
            this.handleExportar(
                idResultadoCalificacion,
                this.dataSourceResultadoPreliminar.data,
                nombre_excel,
            );
        }

        if (idResultadoCalificacion == ResultadoCalificacionEnum.FINAL) {
            nombre_excel = "Resultado_Calificacion_Final-"+dateString+".xlsx";
            this.handleExportar(
                idResultadoCalificacion,
                this.dataSourceResultadoFinal.data,
                nombre_excel
            ); 
            
        }
    };

    handleExportar = (
        idResultadoCalificacion,
        dataSource: any[],
        nombreExcel: string
    ) => {
        if (dataSource.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    '"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',
                    () => {}
                );
            return;
        }

        this.cargarFiltros();
        this.request.idResultadoCalificacion = idResultadoCalificacion;
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Contrataciones()
            .exportarExcelContratacionResultadosCalificaciones(this.request)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response.file) {
                    descargarExcel(response.file, nombreExcel);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
                            () => {}
                        );
                }
            });
    };

    handleLimpiar() {
        this.form.reset();
        this.form.get('numeroDocumentoIdentidad').disable();
        this.form.get('tipoDocumento').setValue('-1');
        this.form.get('estado').setValue('-1');
	this.firstTime=true;
	this.handleBuscar();
    }

    handleRetornar = () => {
        this.router.navigate(["../../../"], { relativeTo: this.route });
    };

    buildShared() {
        this.sharedService.setSharedBreadcrumb(
            "Contratación / Contratación Directa"
        );
        this.sharedService.setSharedTitle("Calificaciones");
    }

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
    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    }

    obtenerFlujoEstado (){
        let data = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
            codigoTipoAccion: TipoAccionEnum.CALIFICACION,
            codigoEstadoInformacion: FlujoEstadoEnum.PENDIENTE,
        }
        this.dataService.Contrataciones()
	    .getFlujoEstado(data)
	    .pipe(
		 catchError(() => { return of(null); })
	     )
	    .subscribe(this.bandejaCalificacion.setFlujoEstado);
    }
}

export class PlazasContratacionResultadoPreliminarDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize,firstTime=false): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Contrataciones()
                .buscarPostulantesCalificacionPaginado(
                    data,
                    pageIndex,
                    pageSize
                )
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((postulantes: any) => {
                    this._dataChange.next(postulantes || []);
                    this.totalregistro =
                        (postulantes || []).length === 0
                            ? 0
                            : postulantes[0].total_registros;
                    if ((postulantes || []).length === 0 && !firstTime) {
			this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
                    }
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

export class PlazasContratacionResultadoFinalDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime=false): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Contrataciones()
                .buscarPostulantesCalificacionPaginado(
                    data,
                    pageIndex,
                    pageSize
                )
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((postulantes: any) => {
                    this._dataChange.next(postulantes || []);
                    this.totalregistro =
                        (postulantes || []).length === 0
                            ? 0
                            : postulantes[0].total_registros;
                    if ((postulantes || []).length === 0 && !firstTime) {
			this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
                    }
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

interface ControlesActivosCalificacion {
    btnRealizarCalificacion: boolean;
    btnObservarPostulante: boolean;
    btnRegistrarReclamo: boolean;
    btnPublicarResultadoPreliminar: boolean;
    btnPublicarResultadoFinal: boolean;
    btnCargaMassiva: boolean;
    btnGenerarOrdenMerito: boolean;
    btnPublicarCuadroMeritoPreliminar: boolean;
    btnPublicarCuadroMeritoFinal: boolean;
}
