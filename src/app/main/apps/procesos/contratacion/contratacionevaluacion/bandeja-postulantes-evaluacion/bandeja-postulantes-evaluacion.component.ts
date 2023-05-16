import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { SharedService } from "../../../../../../core/shared/shared.service";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { SituacionPlazasEnum, CatalogoItemEnum, ResultadoFinalEnum, EstadoPostulacionEnum, RegimenLaboralEnum } from '../../_utils/constants';
import { EtapaResponseModel } from '../../models/contratacion.model';
import { descargarExcel } from "app/core/utility/functions";
import { SecurityModel } from '../../../../../../core/model/security/security.model';
// import { MensajesSolicitud } from '../../../../bandejas/solicitudesatenciones/atenciones/gestion-atenciones/_utils/constants';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { CONFIGURACION_PROCESO_MESSAGE } from '../../../../../../core/model/messages-error';
import { SNACKBAR_BUTTON } from '../../../../../../core/model/message';
import { ComboDefault } from '../../../../../../core/model/types';
import { ModalNuevoPostulanteEvalExpComponent } from "./modal-nuevo-postulante-evaluacion/modal-nuevo-postulante-evaluacion.component";
import { ModalInformacionPostulanteEvalExpComponent } from "./modal-informacion-postulante-eval-exp/modal-informacion-postulante-eval-exp.component";
import { ModalEditarPostulanteEvalExpComponent } from "./modal-editar-postulante-eval-exp/modal-editar-postulante-eval-exp.component";
import { ModalNuevoPostulanteEvaluacionRl30493Component } from './modal-nuevo-postulante-evaluacion-rl30493/modal-nuevo-postulante-evaluacion-rl30493.component';
import { modalPostulante } from '../../models/modalPostulante';
import { BuscadorServidorPublicoComponent } from "../../components/buscador-servidor-publico/buscador-servidor-publico.component";

@Component({
    selector: 'minedu-bandeja-postulantes-evaluacion',
    templateUrl: './bandeja-postulantes-evaluacion.component.html',
    styleUrls: ['./bandeja-postulantes-evaluacion.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class BandejaPostulantesEvaluacionComponent implements OnInit {
    idServidorPublicoSelected: number;
    maxLengthnumeroDocumentoIdentidad: number;
    modalPostulante:modalPostulante = new modalPostulante();
    form: FormGroup;
    idEtapaProceso: number;
    idRegimeLaboral: number;
    codSedeCabecera:string;
    dialogRef: any;
    comboLists = {
        listEstado: [],
        listTipoDocumento: []
    };
    isMobile = false;
    estados: any[] = [];
    tipoDocumentos: any[] = [];
    paginatorPostulantesPageIndex = 0;
    paginatorPostulantesPageSize = 10;
    @ViewChild("paginatorPostulantes", { static: true }) paginatorPostulantes: MatPaginator;
    etapaResponse: EtapaResponseModel;
    plazaContratacion;
    dataSourcePostulantes: PostulantesEvalExpDataSource | null;
    displayedColumnsPostulantes: string[] = [
        "registro",
        "documento",
        "apellidos_nombres",
        "numero_expediente",
        "modalidad_educativa",
        "nivel_educativo",
        "area_curricular",
        "especialidad",
        "estado",
        "tipo_registro",
        "acciones"
    ];
    
    request = {
        idEtapaProceso: null,
        idTipoDocumento: null,
        numeroDocumento: null,
        numeroExpediente: null,
        idEstado: null,
        codigoCentroTrabajoMaestro: null,
    };
    EstadoPostulacionEnum = EstadoPostulacionEnum;
    ResultadoFinalEnum = ResultadoFinalEnum;
    private passport: SecurityModel = new SecurityModel();
    modalRegimeLaboral:any;
    templateRL: string;
    ocultarBotonesAprobacion:boolean = false;
    indicadoresEstadoPostulacion = {
        totalRegistros : 0,
        totalRegistrados : 0,
        totalAprobados : 0,
        totalEliminados : 0,
    };

    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.buildForm();
        this.iniCombos();
        this.buildGrids();
        this.handleResponsive();
        this.obtenerEtapa();

        this.buildSeguridadControles();
        this.codSedeCabecera = this.passport.codigoSede;
        this.obtenerEstadosPostulacion();
    }

    ngAfterViewInit() {
        //this.paginatorPostulantes.page.pipe(tap(() => this.buscarPostulantes())).subscribe();
        //this.handleBuscar();
    }

    iniCombos(): void{
        this.loadEstados();
        this.loadTipoDocumento();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idTipoDocumento: [null],
            numeroDocumentoIdentidad: {value:null,disabled:true},
            numeroExpediente: [null],
            idEstado: [null]
        });
    }

    buildGrids(): void {
        this.dataSourcePostulantes = new PostulantesEvalExpDataSource(this.dataService);
        //this.buildPaginators(this.paginatorPostulantes);
    }

    handPaginator = (paginator:any) => {
	if(!this.paginatorPostulantes){
	    this.paginatorPostulantes = paginator;
	    this.buscarPostulantes();
	}
	else{
	    this.paginatorPostulantes= paginator;
	    //this.buscarPlazasContratacionDocentes(this.request);
	    this.buscarPostulantes();
	}
    };

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

    // TODO : CLEAN HARDCODE
    currentSession: SecurityModel = new SecurityModel();
    
    controlesActivos:ControlesActivosPostulante = {
        btnAprobarPostulantes:false, btnEditarPostulante:false, btnEliminarPostulante:false, btnNuevoPostulante: false, btnSolicitarInformeEscalafonario:false, btnExportar:false  
    }
    buildSeguridadControles = () => {
        const rol = this.dataService.Storage().getPassportRolSelected();
        // Ajustar Valores
        this.currentSession.idRol = 0;  
        switch(rol.CODIGO_TIPO_SEDE){
            case "TS001":
                this.currentSession.idTipoSede = 2;              
                if(rol.CODIGO_ROL == "AYNI_004")
                    this.currentSession.idRol = 5; // Resp. DRE   
                break;
            case "TS002":
                this.currentSession.idTipoSede = 3;
                if(rol.CODIGO_ROL == "AYNI_004")
                    this.currentSession.idRol = 6; // Resp UGEL
                break;
            case "TS004":
                this.currentSession.idTipoSede = 4;
                if(rol.CODIGO_ROL == "AYNI_004") 
                    this.currentSession.idRol = 7; // Resp. IE Militar
                break;
            case "TS005":
                this.currentSession.idTipoSede = 1;
                if(rol.CODIGO_ROL == "AYNI_006")
                    this.currentSession.idRol = 2; // Esp Diten
                if(rol.CODIGO_ROL == "AYNI_004") 
                    this.currentSession.idRol = 5; // Resp. DRE
                break;
            case "TS013":
                this.currentSession.idTipoSede = 1;
                if(rol.CODIGO_ROL == "AYNI_019")
                    this.currentSession.idRol = 9; // Esp Diten
                break;    
            default:
                if(rol.CODIGO_ROL == "AYNI_006")
                    this.currentSession.idRol = 2; // Monitor
                break;
        }

        const data = { 
            idEtapaProceso:this.idEtapaProceso, 
            idTipoSede:this.currentSession.idTipoSede,
            idRol:this.currentSession.idRol
        }

        console.log("Datos entrada seguridad: ",data);
        this.dataService.Contrataciones().getObtenerAccesoUsuariosPostulacion(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Valores de tabla accesos: ",response)
                this.controlesActivos = { 
                    btnAprobarPostulantes:response.aprobarPostulantes,
                    btnNuevoPostulante:response.nuevoPostulante, 
                    btnEditarPostulante:response.editarPostulante, 
                    btnEliminarPostulante: response.eliminarPostulante,
                    btnSolicitarInformeEscalafonario:response.solicitarInformeEscalafonario,
                    btnExportar:true, 
                 }; 
            }
        });       

    }

    handleLimpiar(): void {
        this.resetForm();
	this.form.get('idTipoDocumento').setValue(ComboDefault.ValueTodos)
	this.form.get('numeroDocumentoIdentidad').disable();
    }

    resetForm = () => {
        this.form.reset();
    };

    handleBuscar = () => {
        this.buscarPostulantes();
    }

    private buscarPostulantes = () => {
        this.setRequest();

	if(this.request.numeroDocumento != null && this.request.idTipoDocumento != null){
	    let validacionDocumento = this.modalPostulante.validarDocumento(this.request.numeroDocumento, this.request.idTipoDocumento);
	    if (!validacionDocumento.esValido) {
		this.dataService.Message().msgWarning(validacionDocumento.mensaje);
		return;
	    }
	} 

        this.dataSourcePostulantes.load(
	    this.request,
	    this.paginatorPostulantes.pageIndex + 1,
	    this.paginatorPostulantes.pageSize);
    };

    setRequest() {
        const formulario = this.form.getRawValue();

        let tipoDocumento = formulario.idTipoDocumento == ComboDefault.ValueTodos ? null : formulario.idTipoDocumento;
        let numeroDocumento = formulario.numeroDocumentoIdentidad ? formulario.numeroDocumentoIdentidad : null;
        let numeroExpediente = formulario.numeroExpediente ? formulario.numeroExpediente : null;
        let idEstado = formulario.idEstado == ComboDefault.ValueTodos ? null : formulario.idEstado;

        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idTipoDocumento: tipoDocumento,
            numeroDocumento: numeroDocumento,
            numeroExpediente: numeroExpediente,
            idEstado: idEstado,
            codigoCentroTrabajoMaestro : this.passport.codigoSede,
        };
    }

    loadTipoDocumento() {
        this.dataService.Contrataciones().getComboTipoDocumentos(CatalogoItemEnum.TIPOS_DOCUMENTOS_IDENTIDAD).pipe(
                catchError(() => {
                    this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD, SNACKBAR_BUTTON.CLOSE);
                    return of(null);
                }
            )
        )
        .subscribe((response: any) => {
            if (response) {
                const itemAll = { id: ComboDefault.ValueTodos, descripcion: ComboDefault.TextTodos };
                response.unshift(itemAll);                 
                const data = response.map(x => ({
                    ...x,
                    value: x.id,
                    label: `${x.descripcion}`
                }));
                this.comboLists.listTipoDocumento = data;
                this.form.get('idTipoDocumento').setValue(ComboDefault.ValueTodos);
            }
        });
    }

    loadEstados = () => {
       // this.comboLists.listEstado = data;
        //
        this.dataService.Contrataciones().getComboTipoDocumentos(CatalogoItemEnum.ESTADOS_POSTULANTE).pipe(
            catchError(() => {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.ESTADOS_POSTULANTE, SNACKBAR_BUTTON.CLOSE);
                return of(null);
            }
        )
    )
    .subscribe((response: any) => {
        if (response) {
            console.log(response)
            this.comboLists.listEstado = response;
        } else {
            this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.ESTADOS_POSTULANTE, SNACKBAR_BUTTON.CLOSE);
            this.tipoDocumentos = [];
        }
    });

        /*
        this.dataService.Contrataciones().getCombosEstadosPUN(CatalogoItemEnum.ESTADO_CALIFICACION).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response) {
                const itemAll = { id: ComboDefault.ValueTodos, descripcion: ComboDefault.TextTodos };
                response.unshift(itemAll);                 
                const data = response.map(x => ({
                    ...x,
                    value: x.id,
                    label: `${x.descripcion}`
                }));
                this.comboLists.listEstado = data;
                this.form.get('idEstado').setValue(ComboDefault.ValueTodos);
            }
        }); */
    }

    handleExportarEvalExpPostulantes = () => {
        this.handleExportarPostulantes(this.dataSourcePostulantes.data, "Contratacion_Evaluacion_Expedientes_Postulantes.xlsx");
    }

    handleExportarPostulantes = (dataSource: any[], nombreExcel: string) => {
        if (dataSource.length === 0) {
            this.dataService.Message().msgWarning("No se encontró información para exportar.",
                () => {}
            );
            return;
        }

        this.setRequest();
        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().getExportarExcelPostulacionEvalExp(this.request).pipe(
            catchError((e) => of([e])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, nombreExcel);
            } else {
                this.dataService.Message().msgWarning("No se encontró información para los criterios de búsqueda ingresado",
                    () => {}
                );
            }
        });
    }
    editarPostulanteView = (dataPostulacion:any) => {
	if(this.idRegimeLaboral == RegimenLaboralEnum.LEY_30493){
	    this.dialogRef = this.materialDialog.open(ModalNuevoPostulanteEvaluacionRl30493Component, {
		panelClass: 'minedu-modal-nuevo-postulante-evaluacion-rl30493',
		disableClose: true,
		data: {
		    icon: "save",
		    title: "Registrar Nuevo Postulante",
		    idEtapaProceso: this.idEtapaProceso,
		    idRegimenLaboral: this.idRegimeLaboral,
		    dataForm: dataPostulacion
		}
	    });
	}
	if(this.idRegimeLaboral == RegimenLaboralEnum.LEY_30328) {
	    this.dialogRef = this.materialDialog.open(ModalEditarPostulanteEvalExpComponent, {
		panelClass: 'modal-editar-postulante-eval-exp-dialog',
		disableClose: true,
		data: {
		    icon: "save",
		    title: "Modificar Postulante",
		    datos: dataPostulacion,
		    idEtapaProceso: this.idEtapaProceso
		}
	    });
	} 
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response == 0) {
                this.handleBuscar();
            }
        });
    }
    eliminarPostulante = (data, index) => {
        let requestEliminar = {
            idPostulacion: data.idPostulacion,
            usuarioModificacion: "ADMIN"
        };

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR AL POSTULANTE?',
            () => {
                this.dataService.Spinner().hide("sp6");
                this.dataService.Contrataciones().postEliminarContratacionEvalExpPostulante(requestEliminar).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response > 0) {
                        this.dataService.Message().msgSuccess('"EL POSTULANTE HA SIDO ELIMINADO CORRECTAMENTE"');
                        this.handleBuscar();
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            // this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
                    }
                });
            }
        );
    }
    informacionPostulanteView = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPostulanteEvalExpComponent, {
            panelClass: 'modal-informacion-postulante-eval-exp-dialog',
            disableClose: true,
            data: {
                icon: "eye",
                title: "Información Completa Postulante",
                idEtapaProceso: this.idEtapaProceso,
                datos: dataPostulante
            }
        });
      
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    }
    handleNuevo = () => {
	if(this.idRegimeLaboral == RegimenLaboralEnum.LEY_30493){
	    this.dialogRef = this.materialDialog.open(ModalNuevoPostulanteEvaluacionRl30493Component, {
		panelClass: 'minedu-modal-nuevo-postulante-evaluacion-rl30493',
		disableClose: true,
		data: {
		    icon: "save",
		    title: "Registrar Nuevo Postulante",
		    idEtapaProceso: this.idEtapaProceso,
		    idRegimenLaboral: this.idRegimeLaboral,
		    dataForm: null
		}
	    });
	}
	if(this.idRegimeLaboral == RegimenLaboralEnum.LEY_30328) {
	    this.dialogRef = this.materialDialog.open(ModalNuevoPostulanteEvalExpComponent, {
		panelClass: 'modal-nuevo-postulante-evaluacion-dialog',
		disableClose: true,
		data: {
		    icon: "save",
		    title: "Registrar Nuevo Postulante",
		    idEtapaProceso: this.idEtapaProceso,
		    idRegimenLaboral: this.idRegimeLaboral
		}
	    });
	}
      
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response == 0) {
                this.handleBuscar();
            }
        });
    };

    obtenerEstadosPostulacion(){

        let data = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
        }
        console.log("data entrada indicadores: ", data);
        this.dataService.Contrataciones().getObtenerIndicadoresEstadoPostulacion(data).pipe(
            catchError(() => {
                return of(null);
            })
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Indicadores Estado Postulacion",response);
                this.indicadoresEstadoPostulacion = response;
                this.determinarOcultarBotonesAprobacion();
            } 
        });
    }

    determinarOcultarBotonesAprobacion(){
        let totalRegistros = this.indicadoresEstadoPostulacion.totalRegistros;
        let totalRegistrados = this.indicadoresEstadoPostulacion.totalRegistrados;
        let totalAprobados = this.indicadoresEstadoPostulacion.totalAprobados;
        let totalEliminados = this.indicadoresEstadoPostulacion.totalEliminados;

        if(totalRegistros == 0){
            this.ocultarBotonesAprobacion = false;
            return;
        }
        if((totalRegistros > 0) && (totalAprobados > 0) && (totalRegistrados == 0) && (totalRegistros == totalAprobados+totalEliminados)){
            this.ocultarBotonesAprobacion = true;
            return;
        }else this.ocultarBotonesAprobacion = false;
        console.log("Booleano Ocultarbotones: " + this.ocultarBotonesAprobacion)
    }

    handleAprobarPostulantes = () => {
        let requestAprobar = {
            idEtapaProceso: this.idEtapaProceso,
            usuarioModificacion: "ADMIN",
            codigoCentroTrabajoMaestro: this.passport.codigoSede
        };

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA APROBAR AL POSTULANTE?',
            () => {
                this.dataService.Spinner().hide("sp6");
                this.dataService.Contrataciones().postAprobarContratacionEvalExpPostulante(requestAprobar).pipe(
                    catchError((e) => of([e])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
		    let mensajeResponse = {
			'1':'Se ha aprobado correctamente',
			'2':'No tiene registros a aprobar'
		    };
                    if (response > 0) {
                        //this.dataService.Message().msgSuccess('Se ha aprobado correctamente');
                        this.dataService.Message().msgSuccess(mensajeResponse[response]);
                        this.handleBuscar();
			this.obtenerEstadosPostulacion();
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            // this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
                    }
                });
            }
        );
    }

    handleRetornar = () => {
        this.router.navigate(["../../../"], { relativeTo: this.route });
    };

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    obtenerEtapa(): void {
        this.dataService
            .Contrataciones()
            .obtenerCabeceraEtapaProcesoById(this.idEtapaProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.etapaResponse = {
                        anio: response.anio,
                        codigoEtapa: response.codigo,
                        codigoProceso: response.codigo,
                        codigoEtapaFase: response.codigo,
                        descripcionEstadoEtapaProceso: response.estado,
                        descripcionEtapa: response.etapa,
                        descripcionEtapaFase: response.etapa,
                        descripcionNumeroConvocatoria: response.numero_convocatoria,
                        descripcionRegimenLaboral: response.regimen_laboral,
                        descripcionTipoProceso: response.proceso,
                        fechaCreacion: response.fecha_creacion,
                        idEtapa: response.id_etapa_proceso,
                        idProceso: response.id_proceso,
                    };
                }
            });
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

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación por Evaluación de Expedientes");
        this.sharedService.setSharedTitle("Plazas");
    }

    onDataInformacion = (data:any) => {
	this.idRegimeLaboral = data.idRegimenLaboral;
	this.templateRL = this.generarNombreTemplateDatosPlaza(data.idRegimenLaboral);
    }

    generarNombreTemplateDatosPlaza = (idRegimenLaboral: any):string => {
	let templateRL = 'RL' + (idRegimenLaboral ||'OTRO').toString();
	return templateRL;
    }

    activarCampoNroDocumento(){
	this.maxLengthnumeroDocumentoIdentidad = this.form.get('idTipoDocumento').value == 11 ? 8 : 12;
	this.form.get('numeroDocumentoIdentidad').setValue(null);
        if(this.form.get('idTipoDocumento').value != ComboDefault.ValueTodos)
            this.form.get('numeroDocumentoIdentidad').enable();
        else
            this.form.get('numeroDocumentoIdentidad').disable();
    }

    busquedaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BuscadorServidorPublicoComponent, {
            panelClass: "minedu-buscador-servidor-publico-dialog",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const servidorPublico = resp.servidorPublico;
                this.idServidorPublicoSelected = servidorPublico.idServidorPublico;
                this.form.get("idTipoDocumento").setValue(servidorPublico.idTipoDocumentoIdentidad);
                this.form.get("numeroDocumentoIdentidad").setValue(servidorPublico.numeroDocumentoIdentidad);
            }
        });
    }
}

export class PostulantesEvalExpDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Contrataciones().getBuscarPostulantesPaginadoEvalExp(data, pageIndex, pageSize).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe(response => {
                if (response) {
                    this._dataChange.next(response || []);
                    this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_registros;
                } else {
                    let r = response[0];
                    if (r.status == ResultadoOperacionEnum.InternalServerError) {
                        this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                    } else if (r.status == ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(r.message, () => { });
                    } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                    } else {
                        // this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                    }
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


interface ControlesActivosPostulante{
    btnNuevoPostulante:boolean,
    btnAprobarPostulantes:boolean,
    btnEditarPostulante:boolean,
    btnEliminarPostulante: boolean,
    btnSolicitarInformeEscalafonario:boolean,
    btnExportar:boolean,
}
