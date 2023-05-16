import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { SharedService } from "../../../../../../core/shared/shared.service";
import { BehaviorSubject, of, Observable } from "rxjs";
import { BusquedaPlazaComponent } from "../../components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { catchError, finalize, tap } from 'rxjs/operators';
import { TipoFormatoPlazaEnum, CatalogoItemEnum, EstadoAdjudicacionEnum, RegimenLaboralEnum, MensajesSolicitud, TipoAccionEnum, FlujoEstadoEnum } from '../../_utils/constants';
import { EtapaResponseModel } from '../../models/contratacion.model';
import { descargarExcel } from "app/core/utility/functions";
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from '../../../../../../core/model/messages-error';
import { ComboDefault } from '../../../../../../core/model/types';
import { LocalStorageService } from '../../../../../../../@minedu/services/secure/local-storage.service';
import { ModalNoAdjudicarPUNComponent } from './modal-no-adjudicar-pun/modal-no-adjudicar-pun.component';
import { ModalVerObservacionPUNComponent } from './modal-ver-observacion-pun/modal-ver-observacion-pun.component';
import { ModalSubsanarObservacionPUNComponent } from "./modal-subsanar-observacion-pun/modal-subsanar-observacion-pun.component";
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { ModalActaAdjudicacionPUNComponent } from './modal-acta-adjudicacion-pun/modal-acta-adjudicacion-pun.component';
import { ModalContratoAdjudicacionPUNComponent } from './modal-contrato-adjudicacion-pun/modal-contrato-adjudicacion-pun.component';
import { BuscadorServidorPublicoComponent } from "../../components/buscador-servidor-publico/buscador-servidor-publico.component";
import { modalPostulante } from '../../models/modalPostulante';
import { criterioBusqueda } from '../../models/criterioBusqueda.model';
import { bandejaAdjudicacionPUNModel } from '../../models/bandejaAdjudicacionPUN.model';

@Component({
    selector: 'minedu-bandeja-adjudicacion-pun',
    templateUrl: './bandeja-adjudicacion-pun.component.html',
    styleUrls: ['./bandeja-adjudicacion-pun.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class BandejaAdjudicacionPUNComponent implements OnInit {
    maxLengthnumeroDocumentoIdentidad: number;
    form: FormGroup;
    idEtapaProceso: number;
    codSedeCabecera:string; // added
    firstTime = true;
    estadoAjudicacion = EstadoAdjudicacionEnum;

    estadoDesarrollo:any;
    adjudicacionFinalizada:any;

    dialogRef: any;
    comboLists = {
        listEstado: [],
        listTipoDocumento: []
    };
    isMobile = false;
    centroTrabajoFiltroSeleccionado: any;
    plazaFiltroSeleccionado: any;
    paginatorAdjudicacionPageIndex = 0;
    paginatorAdjudicacionPageSize = 10;
    @ViewChild("paginatorAdjudicacion", { static: true }) paginatorAdjudicacion: MatPaginator;
    etapaResponse: EtapaResponseModel;
    dataSourceAdjudicacion: AdjudicacionDataSource | null;
    displayedColumnsAdjudicacion: string[] = [
        "registro",
        "grupo_inscripcion",
        "orden_merito",
        "documento",
        "apellidos_nombres",
        "puntaje_final_pun",
        "puntaje_desempate",
        "codigo_plaza_adjudicado",
        "descripcion_cargo",
        "centro_trabajo",
        "estado_adjudicacion",
        "acciones",
    ];
    request = {
        idEtapaProceso: null,
        idTipoDocumento: null,
        numeroDocumento: null,
        idEstadoAdjudicacion: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        codigoCentroTrabajoMaestro : null,
    };

    EstadoAdjudicacionEnum = EstadoAdjudicacionEnum;

    filtros: any;

    private passport: SecurityModel = new SecurityModel();
    idServidorPublicoSelected: number;
    modalPostulante:modalPostulante = new modalPostulante();
    bandejaAdjudicacionPUN:bandejaAdjudicacionPUNModel = new bandejaAdjudicacionPUNModel()

    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
        private localStorageService: LocalStorageService
    ) {}

    ngOnInit(): void {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.buildForm();
        this.iniCombos();
        this.buildGrids();
        this.handleResponsive();
        this.obtenerEtapa();
        setTimeout((_) => this.buildShared());


        this.buildSeguridadControles();
        this.codSedeCabecera = this.passport.codigoSede;

        this.obtenerEstadoDesarrolloEtapa();
	this.form.get('numeroDocumentoIdentidad').disable();
	this.obtenerFlujoEstado();
    }

    ngAfterViewInit() {
        this.paginatorAdjudicacion.page.pipe(tap(() => this.handleBuscar())).subscribe();
        this.handleBuscar();
    }

    iniCombos(): void{
        this.loadEstados();    
        this.loadTipoDocumento();      
    }

    totalPostulantes:number = 0;
    totalAdjudicados:number = 0;
    totalNoAdjudicados:number = 0;
    totalObservados:number = 0;

    obtenerEstadoDesarrolloEtapa = () => {
        let idProcesoEtapa = +this.route.snapshot.params.id;
        let codSede = this.passport.codigoSede;

        this.dataService
            .Contrataciones()
            .obtenerCabeceraEstadoDesarrolloEtapaProceso(idProcesoEtapa, codSede)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.estadoDesarrollo = response.estadoDesarrollo;
                    this.adjudicacionFinalizada = response.adjudicacionFinalizada;
                    this.totalPostulantes = response.adjudicacionTotal;
                    this.totalAdjudicados = response.adjudicacionAdjudicados;
                    this.totalNoAdjudicados = response.adjudicacionNoAdjudicados;
                    this.totalObservados = response.adjudicacionObservados;
                }
            console.log("Respuesta total:", response)
            console.log("Estado de desarrollo/FinalizarAdj : ", this.estadoDesarrollo, this.adjudicacionFinalizada);
            });
    };

    buildForm(): void {
        this.filtros = JSON.parse(this.localStorageService.getItem('_filtrosTmp'));

        if (this.filtros != null) {
            this.form = this.formBuilder.group({
                idTipoDocumento: this.filtros.idTipoDocumento == null ? ComboDefault.ValueTodos : this.filtros.idTipoDocumento,
                numeroDocumentoIdentidad: this.filtros.numeroDocumentoIdentidad,
                codigoCentroTrabajo: [null],
                codigoPlaza: [null],
                idEstado: this.filtros.idEstado == null ? ComboDefault.ValueTodos : this.filtros.idEstado
            });
            
            this.paginatorAdjudicacionPageIndex = this.filtros.paginaActual;
            this.paginatorAdjudicacionPageSize = this.filtros.tamanioPagina;
            this.localStorageService.removeItem('_filtrosTmp');
            setTimeout((_) => this.handleBuscar());
        } else {
            this.form = this.formBuilder.group({
                idTipoDocumento: [ComboDefault.ValueTodos],
                numeroDocumentoIdentidad: [null],
                codigoCentroTrabajo: [null],
                codigoPlaza: [null],
                idEstado: [ComboDefault.ValueTodos]
            });
        }
    }

    buildGrids(): void {
        this.dataSourceAdjudicacion = new AdjudicacionDataSource(this.dataService);
        this.buildPaginators(this.paginatorAdjudicacion);
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

    // TODO : CLEAN HARDCODE
    currentSession: SecurityModel = new SecurityModel();
    controlesActivos:ControlesActivosAdjudicacion = {
        btnFinalizarAdjudicacion:false, btnFinalizarEtapa:false, btnAdjudicarPlaza:false, btnNoAdjudicarPlaza: false, btnSubsanarObservacion:false, btnExportar:false   
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
        this.dataService.Contrataciones().getObtenerAccesoUsuariosAdjudicacion(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Valores de tabla accesos: ",response)
                this.controlesActivos = { 
                    btnFinalizarAdjudicacion:response.finalizarAdjudicacion,
                    btnFinalizarEtapa:response.finalizarEtapa, 
                    btnAdjudicarPlaza:response.adjudicarPlaza, 
                    btnNoAdjudicarPlaza: response.noAdjudicarPlaza,
                    btnSubsanarObservacion:response.subsanarObservacion, 
                    btnExportar:true, 
                 }; 
            }
        });       

    }

    handleLimpiar(): void {
        this.resetForm();
        this.form.get('idTipoDocumento').setValue(ComboDefault.ValueTodos);
	this.form.get('numeroDocumentoIdentidad').disable();
    }

    resetForm = () => {
        this.form.reset();
    };

    handleBuscar = () => {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        this.setRequest();
        // console.log("request data: ", this.request);
        // console.log("passpoertt data: ", this.passport.codigoSede);

	if(this.request.numeroDocumento != null && this.request.idTipoDocumento != null){
	    let validacionDocumento = this.modalPostulante.validarDocumento(this.request.numeroDocumento, this.request.idTipoDocumento);
	    if (!validacionDocumento.esValido) {
		this.dataService.Message().msgWarning(validacionDocumento.mensaje);
		return;
	    }
	} 

        if (this.request.codigoPlaza) {
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(this.request.codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (this.request.codigoCentroTrabajo) {
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(this.request.codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }

        this.dataSourceAdjudicacion.load(this.request, this.paginatorAdjudicacion.pageIndex + 1, this.paginatorAdjudicacion.pageSize, this.firstTime);
        this.firstTime = false;
    }

    handleActasAdjudicacion = (d) => {
        this.dataService.Spinner().show("sp6");
        this.dialogRef = this.materialDialog.open(ModalActaAdjudicacionPUNComponent,
            {
                panelClass: "modal-acta-adjudicacion-pun-dialog",
                width: "100%",
                disableClose: true,
                data: {
                    adjudicacion: d,
                    etapaResponse: this.etapaResponse,
                    passport: this.passport
                },
            }
        );
    }

    handleContratosAdjudicacion = (d) => {
        this.dataService.Spinner().show("sp6");
        debugger;
        this.dialogRef = this.materialDialog.open(ModalContratoAdjudicacionPUNComponent,
            {
                // panelClass: "modal-contrato-adjudicacion-pun-dialog",
                panelClass: "modal-contrato-adjudicacion-directa-dialog",
                width: "100%",
                disableClose: true,
                data: {
                    adjudicacion: d,
                    etapaResponse: this.etapaResponse,
                    passport: this.passport
                },
            }
        );
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
            }
        });
    }

    loadEstados = () => {
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
            }
        });
    }

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1300px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                    idEtapaProceso: this.idEtapaProceso,
                    codigoSede : this.passport.codigoSede,
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
                this.centroTrabajoFiltroSeleccionado = { ...result.centroTrabajo };
            }
        });
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "1900px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
		idRegimenLaboral: RegimenLaboralEnum.LEY_30328,
		idEtapaProceso: this.idEtapaProceso,
		codigoCentroTrabajo: this.passport.codigoSede
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }

    setRequest() {
        const formulario = this.form.getRawValue();
        
        let idTipoDocumento = this.form.value.idTipoDocumento == ComboDefault.ValueTodos ? null : this.form.value.idTipoDocumento;
        let numeroDocumento = formulario.numeroDocumentoIdentidad ? formulario.numeroDocumentoIdentidad : null;
        let idEstado = this.form.value.idEstado == ComboDefault.ValueTodos ? null : this.form.value.idEstado;
        let codigoPlaza = formulario.codigoPlaza ? formulario.codigoPlaza : null;
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo ? formulario.codigoCentroTrabajo : null;
        
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idTipoDocumento: idTipoDocumento,
            numeroDocumento: numeroDocumento,
            idEstadoAdjudicacion: idEstado,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo,
            codigoCentroTrabajoMaestro : this.passport.codigoSede,
        };
    }

    handleExportarAdjudicacion = () => {
        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        var nombreExcel = "Contratacion_Adjudicacion";
        try{
            var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = nombreExcel+"" + ".xlsx";
        }
        // ************************************************************************************************

        this.handleExportar(this.dataSourceAdjudicacion.data, nombreExportar);
    }

    handleExportar = (dataSource: any[], nombreExcel: string) => {
        if (dataSource.length === 0) {
            this.dataService.Message().msgWarning("No se encontró información para exportar.",
                () => {}
            );
            return;
        }

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().getExportarExcelAdjudicacionPUN(this.request).pipe(
            catchError((e) => of([e])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response) => {
            let r = response[0];
            if (r == null) {
                descargarExcel(response.file, nombreExcel);
            } else {
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

    handleInformacion = (d) => {
        var r = { ...this.request, paginaActual: this.paginatorAdjudicacion.pageIndex, tamanioPagina: this.paginatorAdjudicacion.pageSize };
        this.localStorageService.setItem('_filtrosTmp', JSON.stringify(r));
        this.router.navigate(['./informacion-adjudicacion/' + d.idAdjudicacion + '/' + d.idPersona + '/' + d.idCalificacion], {
            relativeTo: this.route,
        })
    }

    handleNoAdjudicar = (d) => {
        this.dialogRef = this.materialDialog.open(ModalNoAdjudicarPUNComponent, {
            panelClass: "modal-no-adjudicar-pun-dialog",
            width: "600px",
            disableClose: true,
            data: d,
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.obtenerEstadoDesarrolloEtapa
                this.handleBuscar();
            } else {
                return;
            }
        });
    }

    handleAdjudicar = (d) => {
        var r = { ...this.request, paginaActual: this.paginatorAdjudicacion.pageIndex, tamanioPagina: this.paginatorAdjudicacion.pageSize };
        this.localStorageService.setItem('_filtrosTmp', JSON.stringify(r));
        this.router.navigate(['./adjudicar-plaza-pun/' + d.idAdjudicacion + '/' + d.idPersona], {
            relativeTo: this.route,
        })
    }

    handleVerObservacion = (d) => {
        this.dialogRef = this.materialDialog.open(ModalVerObservacionPUNComponent, {
            panelClass: "modal-ver-observacion-pun-dialog",
            width: "600px",
            disableClose: true,
            data: d,
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });
    }

    handleFinalizarAdjudicacion = () => {
        // buscar pendientes.puntajeMaximoPadre
        console.log("data adjudicaicon grid",  this.dataSourceAdjudicacion.data)
        const data = this.dataSourceAdjudicacion.data.find(x => x.codigoEstadoAdjudicacion == this.estadoAjudicacion.PENDIENTE);

        if (data) {
            this.dataService.Message().msgWarning('"AÚN TIENE POSTULANTES PENDIENTES PARA SU ADJUDICACIÓN."');
            return;
        }

        // finalizar
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE DESEA FINALIZAR ADJUDICACIÓN?', () => {
            this.dataService.Spinner().show("sp6");
            let d = {
                idEtapaProceso: this.idEtapaProceso,
                usuarioModificacion: this.passport.numeroDocumento,
		codigoCentroTrabajoMaestro : this.passport.codigoSede,
                idFlujoEstado: this.bandejaAdjudicacionPUN.getIdFlujoEstado()
            };
            this.dataService.Contrataciones().postFinalizarAdjudicacion(d).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message().msgSuccess(MensajesSolicitud.M07, () => {});
                         this.obtenerEstadoDesarrolloEtapa();
                         this.obtenerFlujoEstado();
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

    handleFinalizarEtapa = () => {
        
        const data = this.dataSourceAdjudicacion.data.find(x => x.codigoEstadoAdjudicacion == this.estadoAjudicacion.PENDIENTE);

        if (data) {
            this.dataService.Message().msgWarning('"AÚN TIENE POSTULANTES PENDIENTES PARA SU ADJUDICACIÓN."');
            return;
        }
        console.log("Datos data: ", this.dataSourceAdjudicacion.data);

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE QUE FINALIZAR ETAPA?', () => {
            this.dataService.Spinner().show("sp6");
            let d = {
                idEtapaProceso: this.idEtapaProceso,
                usuarioModificacion: this.passport.numeroDocumento,
                codigoCentroTrabajoMaestro: this.passport.codigoSede,
                idFlujoEstado : this.bandejaAdjudicacionPUN.getIdFlujoEstado()
            };
            this.dataService.Contrataciones().postFinalizarEtapa(d).pipe(
                catchError(e => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    console.log("response finalizar etapa",response);
                    if (response > -1) {
                        this.dataService.Message().msgSuccess(MensajesSolicitud.M07, () => {});
                        this.obtenerEstadoDesarrolloEtapa();
                         this.obtenerFlujoEstado();
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

    handleSubsanarObservacion = (d) => {
	d =  {...d,editar:true};
        this.dialogRef = this.materialDialog.open(ModalSubsanarObservacionPUNComponent, {
            panelClass: "modal-subsanar-observacion-pun-dialog",
            width: "600px",
            disableClose: true,
            data: d,
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });
    }

    handleVisualizarSubsanacion = (d) => {
	d =  {...d,editar:false};
        this.dialogRef = this.materialDialog.open(ModalSubsanarObservacionPUNComponent, {
            panelClass: "modal-subsanar-observacion-pun-dialog",
            width: "600px",
            disableClose: true,
            data: d,
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
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
        this.sharedService.setSharedBreadcrumb("Contratación / Adjudicaciones de Resultados de PUN");
        this.sharedService.setSharedTitle("Adjudicación");
    }

    activarCampoNroDocumento(){
	this.maxLengthnumeroDocumentoIdentidad = this.form.get('idTipoDocumento').value == 11 ? 8 : 12;
	this.form.get('numeroDocumentoIdentidad').setValue(null);
        if(this.form.get('idTipoDocumento').value != ComboDefault.ValueTodos)
            this.form.get('numeroDocumentoIdentidad').enable();
        else
            this.form.get('numeroDocumentoIdentidad').disable();
    }
    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
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
    obtenerFlujoEstado (){
	let data = {
	    idEtapaProceso: this.idEtapaProceso,
	    codigoCentroTrabajoMaestro: this.codSedeCabecera,
	    codigoTipoAccion: TipoAccionEnum.ADJUDICACION,
	    codigoEstadoInformacion: FlujoEstadoEnum.PENDIENTE,
	}
	this.dataService.Contrataciones()
	.getFlujoEstado(data)
	.pipe(
	    catchError(() => { return of(null); })
	)
	.subscribe(this.bandejaAdjudicacionPUN.setFlujoEstado);
    }
}

export class AdjudicacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    public verOrden = false;
    public verPublicar = false;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize,  firstTime=false): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Contrataciones().getBuscarAdjudicacionPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((d: any) => {
                this._dataChange.next(d || []);
                this.totalregistro = (d || []).length === 0 ? 0 : d[0].total_registros;
                
                if (d.length > 0) {
                    this.verOrden = !d[0].tienePendiente;
                    this.verPublicar = !d[0].tieneOrdenPendiente;
                }
                
                if ((d || []).length === 0 && !firstTime) {
                    this.dataService.Message().msgAutoCloseWarningNoButton('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',3000, () => {});
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

    get VerOrden(): boolean {
        return this.verOrden;
    }
    get VerPublicar(): boolean {
        return this.verPublicar;
    }
}

interface ControlesActivosAdjudicacion{
    btnFinalizarAdjudicacion:boolean,
    btnFinalizarEtapa:boolean,
    btnAdjudicarPlaza:boolean,
    btnNoAdjudicarPlaza: boolean,
    btnSubsanarObservacion:boolean,
    btnExportar:boolean,
}
