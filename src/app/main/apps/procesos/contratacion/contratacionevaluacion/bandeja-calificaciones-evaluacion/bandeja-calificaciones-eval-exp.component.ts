import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router  } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { SharedService } from "../../../../../../core/shared/shared.service";
import { BehaviorSubject, of, Observable } from "rxjs";
import { catchError, finalize, tap } from 'rxjs/operators';
import { ActivoFlagEnum, CatalogoItemEnum, EstadoCalificacionEnum, ResultadoCalificacionEnum } from '../../_utils/constants';
import { EtapaResponseModel } from '../../models/contratacion.model';
import { descargarExcel } from "app/core/utility/functions";
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from '../../../../../../core/model/messages-error';
import { TablaConfiguracionFuncionalidad, TablaConfiguracionSistema } from "app/core/model/types";
import { ComboDefault } from '../../../../../../core/model/types';
import { LocalStorageService } from '../../../../../../../@minedu/services/secure/local-storage.service';
import { DocumentViewerComponent } from '../../../../components/document-viewer/document-viewer.component';
import { saveAs } from 'file-saver';
import { ResultadoOperacionEnum } from '../../../../bandejas/actividades/gestion-pendientes/_utils/constants';
import { MISSING_TOKEN } from '../../../rotacion/_utils/constants';
import { PASSPORT_MESSAGE } from '../../../../../../core/model/message';
// import { MensajesSolicitud } from '../../../../bandejas/solicitudesatenciones/atenciones/gestion-atenciones/_utils/constants';
import { ModalObservarPostulacionPUNComponent } from "../../contratacionresultadospun/bandeja-calificaciones-pun/modal-observar-postulacion-pun/modal-observar-postulacion-pun.component";
import { ModaRegistrarReclamoPUNComponent } from "../../contratacionresultadospun/bandeja-calificaciones-pun/modal-registrar-reclamo-pun/modal-registrar-reclamo-pun.component";
import { BuscadorServidorPublicoComponent } from "../../components/buscador-servidor-publico/buscador-servidor-publico.component";
import { modalPostulante } from '../../models/modalPostulante';



@Component({
    selector: 'minedu-bandeja-calificaciones-eval-exp',
    templateUrl: './bandeja-calificaciones-eval-exp.component.html',
    styleUrls: ['./bandeja-calificaciones-eval-exp.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class BandejaCalificacionesEvalExpComponent implements OnInit {
    modalPostulante:modalPostulante = new modalPostulante();
    firstTime = true;
    maxLengthnumeroDocumentoIdentidad: number;
    idServidorPublicoSelected: number;
    form: FormGroup;
    idEtapaProceso: number;
    codSedeCabecera:string;

    seHaModificadoCalificacion : boolean = false;

    dialogRef: any;
    selectTab = 0;
    selectTabId = {
        MeritoPreliminar: 0,
        MeritoFinal: 1
    }
    comboLists = {
        listEstado: [],
        listGrupoInscripcion: [],
        listTipoDocumento: [],
        listModalidadEducativa: [],
        listNivelEducativo: []
    };
    isMobile = false;

    estadoDesarrollo:any;
    estadoDesarrolloCalificacion:any;
    estadoCalificacion:any;
    sumaCalificacionOrdenMerito:any;
    cantidadCalificacionObservados:any;
    cantidadCalificacionNoPendientes:any;
    cantidadCalificacionPendientes:any;

    paginatorMeritoPreliminarPageIndex = 0;
    paginatorMeritoPreliminarPageSize = 10;
    paginatorMeritoFinalPageIndex = 0;
    paginatorMeritoFinalPageSize = 10;
    @ViewChild("paginatorMeritoPreliminar", { static: true }) paginatorMeritoPreliminar: MatPaginator;
    @ViewChild("paginatorMeritoFinal", { static: true }) paginatorMeritoFinal: MatPaginator;
    etapaResponse: EtapaResponseModel;
    dataSourcePersistentIncorporadas: string;
    dataSourceMeritoPreliminar: CuadroMeritoPreliminarPUNDataSource | null;
    dataSourceMeritoFinal: CuadroMeritoFinalPUNDataSource | null;
    displayedColumnsMeritoPreliminar: string[] = [
        "registro",
        "modalidad_educativa",
        "nivel_educativo",
        "cargo",
        "especialidad",
        "centro_trabajo",
        "apellidos_nombres",
        "documento",
        "numero_expediente",
        "codigo_plaza",
        "bonificaciones",
        "puntajeTotalFinal",
        "estado",
        "con_reclamo",
        "acciones",
    ];
    displayedColumnsMeritoFinal: string[] = [
        "registro",
        "modalidad_educativa",
        "nivel_educativo",
        "cargo",
        "especialidad",
        "centro_trabajo",
        "apellidos_nombres",
        "documento",
        "numero_expediente",
        "codigo_plaza",
        "bonificaciones",
        "puntajeTotalFinal",
        "estado",
        "con_reclamo",
        "acciones",
    ];
    requestMeritoPreliminar = {
        idResultadoCalificacion: null,
        idEtapaProceso: null,
        idGrupoInscripcion: null,
        idTipoDocumento: null,
        numeroDocumento: null,
        idEstadoCalificacion: null,
        codigoCentroTrabajoMaestro:null,
        idModalidadEducativa: null,
        idNivelEducativo:null
    };

    requestMeritoFinal = {
        idResultadoCalificacion: null,
        idEtapaProceso: null,
        idGrupoInscripcion: null,
        idTipoDocumento: null,
        numeroDocumento: null,
        idEstadoCalificacion: null,
        codigoCentroTrabajoMaestro:null,
        idModalidadEducativa: null,
        idNivelEducativo:null
    };

    requestExportar = {
        idResultadoCalificacion: null,
        idEtapaProceso: null,
        idGrupoInscripcion: null,
        idTipoDocumento: null,
        numeroDocumento: null,
        idEstadoCalificacion: null,
        codigoCentroTrabajoMaestro:null,
    }

    EstadoCalificacionEnum = EstadoCalificacionEnum;
    ResultadoCalificacionEnum = ResultadoCalificacionEnum; 

    filtros: any;

    private passport: SecurityModel = new SecurityModel();
    private routeData;
    mostrarVerCuadroMeritoPDF:boolean = false;
    calificacionPublicadoPreliminar=0;
    calificacionPublicadoFinal=0;
    nombrebtnVerMerito = {'0':'Ver Cuadro de Mérito Preliminar','1':'Ver Cuadro de Mérito Final'};
    tituloCuadroMerito:string=this.nombrebtnVerMerito[0];

    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
        private localStorageService: LocalStorageService
    ) {
        route.data.subscribe(data => console.log(data.title));
    }

    ngOnInit(): void {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        console.log(this.idEtapaProceso);
        this.buildForm();
        this.iniCombos();
        this.buildGrids();
        this.handleResponsive();
        this.obtenerEtapa();
        setTimeout((_) => this.buildShared());

        this.buildSeguridadControles();
        this.codSedeCabecera = this.passport.codigoSede;
        this.obtenerEstadoDesarrolloEtapa();

    }
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
                    this.estadoDesarrolloCalificacion = response.estadoDesarrolloCalificacion;
                    this.estadoCalificacion = response.estadoCalificacion;
                    this.sumaCalificacionOrdenMerito = response.sumaCalificacionOrdenMerito;
                    this.cantidadCalificacionObservados = response.cantidadCalificacionObservados; 
                    this.cantidadCalificacionNoPendientes = response.cantidadCalificacionNoPendientes; 
                    this.cantidadCalificacionPendientes = response.cantidadCalificacionPendientes; 
                }
            console.log("Estado de desarrollo y otros : ", this.estadoDesarrollo, this.estadoCalificacion, this.estadoDesarrolloCalificacion, this.sumaCalificacionOrdenMerito, this.cantidadCalificacionObservados, this.cantidadCalificacionNoPendientes, this.cantidadCalificacionPendientes);
            });
    };

    ngAfterViewInit() {
        this.paginatorMeritoPreliminar.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();
        this.paginatorMeritoFinal.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();
        this.handleBuscar();
    }

    iniCombos(): void{
        this.loadGrupoInscripcion();
        this.loadEstados();    
        this.loadTipoDocumento();  
        this.loadModalidadEducativa();
        this.loadNivelEducativo();    
    }

    buildForm(): void {
        this.filtros = JSON.parse(this.localStorageService.getItem('_filtrosTmp'));

        if (this.filtros != null) {
            this.form = this.formBuilder.group({
                idGrupoInscripcion: this.filtros.idGrupoInscripcion == null ? ComboDefault.ValueTodos : this.filtros.idGrupoInscripcion,
                idTipoDocumento: this.filtros.idTipoDocumento == null ? ComboDefault.ValueTodos : this.filtros.idTipoDocumento,
                numeroDocumentoIdentidad: this.filtros.numeroDocumentoIdentidad,
                idEstado: this.filtros.idEstado == null ? ComboDefault.ValueTodos : this.filtros.idEstado,
                idModalidadEducativa: this.filtros.idModalidadEducativa == null ? ComboDefault.ValueTodos : this.filtros.idModalidadEducativa,
                idNivelEducativo: this.filtros.idNivelEducativo == null ? ComboDefault.ValueTodos : this.filtros.idNivelEducativo,
            });
            
            if (this.filtros.idResultadoCalificacion == ResultadoCalificacionEnum.PRELIMINAR) {
                this.paginatorMeritoPreliminarPageIndex = this.filtros.paginaActual;
                this.paginatorMeritoPreliminarPageSize = this.filtros.tamanioPagina;
                this.selectTab = 0;
            } else if (this.filtros.idResultadoCalificacion == ResultadoCalificacionEnum.FINAL) {
                this.selectTab = 1;
                this.paginatorMeritoFinalPageIndex = this.filtros.paginaActual;
                this.paginatorMeritoFinalPageSize = this.filtros.tamanioPagina;
            } 
            this.localStorageService.removeItem('_filtrosTmp');
            setTimeout((_) => this.handleBuscar());
        } else {
            this.form = this.formBuilder.group({
                idGrupoInscripcion: [ComboDefault.ValueTodos],
                idTipoDocumento: [ComboDefault.ValueTodos],
                numeroDocumentoIdentidad: [null],
                idEstado: [ComboDefault.ValueTodos],
                idModalidadEducativa: [ComboDefault.ValueTodos],
                idNivelEducativo: [ComboDefault.ValueTodos],
            });
        }
        this.form.get('numeroDocumentoIdentidad').disable();
    }

    buildGrids(): void {
        this.dataSourceMeritoPreliminar = new CuadroMeritoPreliminarPUNDataSource(this.dataService);
        this.dataSourceMeritoFinal = new CuadroMeritoFinalPUNDataSource(this.dataService);
        this.buildPaginators(this.paginatorMeritoPreliminar);
        this.buildPaginators(this.paginatorMeritoFinal);
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

     controlesActivos:ControlesActivosCalificacion = {
         btnCargaMassiva:false, btnGenerarOrdenMerito:false, btnObservarPostulante:false, btnPublicarCuadroMeritoFinal: false, btnPublicarCuadroMeritoPreliminar:false, btnPublicarResultadoFinal:false, btnPublicarResultadoPreliminar:false, btnRealizarCalificacion:false, btnRegistrarReclamo:false   
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
         this.dataService.Contrataciones().getObtenerAccesoUsuariosCalificaciones(data).pipe(catchError((e) => of([e])),
             finalize(() => {})
         )
         .subscribe((response: any) => {
             if (response) {
                 console.log("Valores de tabla accesos: ",response)
                 this.controlesActivos = { 
                     btnCargaMassiva:true,
                     btnGenerarOrdenMerito:true, 
                     btnObservarPostulante: true,
                     btnPublicarCuadroMeritoFinal:true, 
                     btnPublicarCuadroMeritoPreliminar:true, 
                     btnPublicarResultadoFinal:true, 
                     btnPublicarResultadoPreliminar:true, 
                     btnRealizarCalificacion:true, 
                     btnRegistrarReclamo:true
                  }; 
             }
         });       
 
     }
 

    handleLimpiar(): void {
        this.resetForm();
	this.form.get('numeroDocumentoIdentidad').disable();
        this.form.get('idTipoDocumento').setValue(ComboDefault.ValueTodos);
    }

    resetForm = () => {
        this.form.reset();
    };

    handleBuscarPaginator = () => {
        if(this.firstTime) 
        {
            this.buscarCuadroMeritoPreliminar();
            this.buscarCuadroMeritoFinal();
            this.firstTime = false;
        }
        else{
            if (this.selectTab == this.selectTabId.MeritoPreliminar) {
                this.mostrarVerCuadroMeritoPDF = (this.calificacionPublicadoPreliminar == 1);
                this.buscarCuadroMeritoPreliminar();
            }
            if (this.selectTab == this.selectTabId.MeritoFinal) {
                this.mostrarVerCuadroMeritoPDF = (this.calificacionPublicadoFinal == 1);
                this.buscarCuadroMeritoFinal();
            }
        }
        this.firstTime = false;
    }

    handleBuscar = () => {
	this.paginatorMeritoFinal.firstPage();
	this.paginatorMeritoPreliminar.firstPage();
	this.handleBuscarPaginator();
	this.firstTime = false;
    }

    handleSelectTab = (e) => {
	this.tituloCuadroMerito = this.nombrebtnVerMerito[e.index+''];
	this.firstTime = true;
	this.paginatorMeritoFinal.firstPage();
	this.paginatorMeritoPreliminar.firstPage();
	this.handleBuscarPaginator();
    };

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

    loadGrupoInscripcion = () => {
        /*
        this.dataService.Contrataciones().getComboGrupoInscripcion().pipe(
            catchError(() => of([])),
            finalize(() => {})
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
                this.comboLists.listGrupoInscripcion = data;
            }
        });
            */
    };

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

    loadModalidadEducativa = () => {
        this.dataService.Contrataciones().getComboModalidadEducativaList(true).pipe(
            catchError(() => of([])),
            finalize(() => {})
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
                this.comboLists.listModalidadEducativa = data;
            }
        });
    };
    loadNivelEducativo = () => {
        this.dataService.Contrataciones().getComboNivelEducativo(true).pipe(
            catchError(() => of([])),
            finalize(() => {})
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
                this.comboLists.listNivelEducativo = data;
            }
        });
    };

    private buscarCuadroMeritoPreliminar = () => {
        this.setRequestMeritoPreliminar();

	if(this.requestMeritoPreliminar.numeroDocumento 
	   != null && this.requestMeritoPreliminar.idTipoDocumento != null){
	    let validacionDocumento = this.modalPostulante.validarDocumento(
					    this.requestMeritoPreliminar.numeroDocumento,
					    this.requestMeritoPreliminar.idTipoDocumento);
	    if (!validacionDocumento.esValido) {
		this.dataService.Message().msgWarning(validacionDocumento.mensaje);
		return;
	    }
	} 

        this.dataSourceMeritoPreliminar.load(this.requestMeritoPreliminar, this.paginatorMeritoPreliminar.pageIndex + 1, this.paginatorMeritoPreliminar.pageSize,this.firstTime);
    };

    private buscarCuadroMeritoFinal = () => {
        this.setRequestMeritoFinal();
	if(this.requestMeritoFinal.numeroDocumento != null 
	   && this.requestMeritoFinal.idTipoDocumento != null){
	    let validacionDocumento = this.modalPostulante.validarDocumento(this.requestMeritoFinal.numeroDocumento,
									    this.requestMeritoFinal.idTipoDocumento);
	    if (!validacionDocumento.esValido) {
		this.dataService.Message().msgWarning(validacionDocumento.mensaje);
		return;
	    }
	} 
        this.dataSourceMeritoFinal.load(this.requestMeritoFinal, this.paginatorMeritoFinal.pageIndex + 1, this.paginatorMeritoFinal.pageSize,this.firstTime);
    };

    setRequestMeritoPreliminar() {
        const formulario = this.form.getRawValue();
        
        let idGrupoInscripcion = this.form.value.idGrupoInscripcion == ComboDefault.ValueTodos ? null : this.form.value.idGrupoInscripcion;
        let idTipoDocumento = this.form.value.idTipoDocumento == ComboDefault.ValueTodos ? null : this.form.value.idTipoDocumento;
        let numeroDocumento = formulario.numeroDocumentoIdentidad ? formulario.numeroDocumentoIdentidad : null;
        let idEstado = this.form.value.idEstado == ComboDefault.ValueTodos ? null : this.form.value.idEstado;

        let idModalidadEducativa = this.form.value.idModalidadEducativa == ComboDefault.ValueTodos ? null : this.form.value.idModalidadEducativa;
        let idNivelEducativo = this.form.value.idNivelEducativo == ComboDefault.ValueTodos ? null : this.form.value.idNivelEducativo;


        this.requestMeritoPreliminar = {
            idResultadoCalificacion: ResultadoCalificacionEnum.PRELIMINAR,
            idEtapaProceso: this.idEtapaProceso,
            idGrupoInscripcion: idGrupoInscripcion,
            idTipoDocumento: idTipoDocumento,
            numeroDocumento: numeroDocumento,
            idEstadoCalificacion: idEstado,
            codigoCentroTrabajoMaestro : this.passport.codigoSede,
            idModalidadEducativa: idModalidadEducativa,
            idNivelEducativo:idNivelEducativo,
        };
    }

    setRequestMeritoFinal() {
        const formulario = this.form.getRawValue();
    
        let idTipoDocumento = this.form.value.idTipoDocumento == ComboDefault.ValueTodos ? null : this.form.value.idTipoDocumento;
        let numeroDocumento = formulario.numeroDocumentoIdentidad ? formulario.numeroDocumentoIdentidad : null;
        let idEstado = this.form.value.idEstado == ComboDefault.ValueTodos ? null : this.form.value.idEstado;

        let idModalidadEducativa = this.form.value.idModalidadEducativa == ComboDefault.ValueTodos ? null : this.form.value.idModalidadEducativa;
        let idNivelEducativo = this.form.value.idNivelEducativo == ComboDefault.ValueTodos ? null : this.form.value.idNivelEducativo;

        this.requestMeritoFinal = {
            idResultadoCalificacion: ResultadoCalificacionEnum.FINAL,
            idEtapaProceso: this.idEtapaProceso,
            idGrupoInscripcion: null,
            idTipoDocumento: idTipoDocumento,
            numeroDocumento: numeroDocumento,
            idEstadoCalificacion: idEstado,
            codigoCentroTrabajoMaestro : this.passport.codigoSede,
            idModalidadEducativa: idModalidadEducativa,
            idNivelEducativo:idNivelEducativo,
        };
    }

    setRequestExportar(idResultadoCalificacion) {
        const formulario = this.form.getRawValue();
    
        let idGrupoInscripcion = this.form.value.idGrupoInscripcion == ComboDefault.ValueTodos ? null : this.form.value.idGrupoInscripcion;
        let idTipoDocumento = this.form.value.idTipoDocumento == ComboDefault.ValueTodos ? null : this.form.value.idTipoDocumento;
        let numeroDocumento = formulario.numeroDocumentoIdentidad ? formulario.numeroDocumentoIdentidad : null;
        let idEstado = this.form.value.idEstado == ComboDefault.ValueTodos ? null : this.form.value.idEstado;

        this.requestExportar = {
            idResultadoCalificacion: idResultadoCalificacion,
            idEtapaProceso: this.idEtapaProceso,
            idGrupoInscripcion: idGrupoInscripcion,
            idTipoDocumento: idTipoDocumento,
            numeroDocumento: numeroDocumento,
            idEstadoCalificacion: idEstado,
            codigoCentroTrabajoMaestro:this.passport.codigoSede,
        };
    }

    private routeGenerator = (data: any): string => {
        const param =
            (TablaConfiguracionSistema.PERSONAL + "").padStart(3, "0") +
            (TablaConfiguracionFuncionalidad.REGISTRAR_CALIFICACIONES_PUN + "").padStart(
                4,
                "0"
            ) +
            (data.idEtapaProceso + "").padStart(10, "0") +
            (data.codigo + "").padStart(10, "0") +
            "0000000000";
                
        return param;
    };

    handlePublicarCuadroMeritoPreliminar = () => {
        
        if(this.seHaModificadoCalificacion){
            this.dataService.Message().msgAutoCloseWarningNoButton('SE HA RELIZADO MODIFICACIÓN POR LO TANTO DEBE DE GENERAR EL ORDEN DE MÉRITO.', 3000,()=>{});
        }


        if (this.dataSourceMeritoPreliminar.data.length == 0) {
            this.dataService.Message().msgWarning('No tiene que publicar.', () => { });
            return;
        }

        this.dataService.Message().msgConfirm(
            'ESTÁ SEGURO QUE DESEA PUBLICAR EL CUADRO DE MÉRITO PRELIMINAR?',
            () => {
                this.dataService.Spinner().show("sp6");
                
                let request = {
                    idEtapaProceso: this.idEtapaProceso,
                    usuarioModificacion: this.passport.numeroDocumento,
                    codigoCentroTrabajoMaestro: this.passport.codigoSede,
                };

                this.dataService.Contrataciones().postPublicarPreliminarCalificacion(request).pipe(
                    catchError((e) => of([e])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response > -1) {
                        // this.dataService.Message().msgAutoCloseSuccessNoButton(MensajesSolicitud.M07,3000, () => {});
                        this.handleBuscar();
                        this.obtenerEstadoDesarrolloEtapa();
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

    handlePublicarCuadroMeritoFinal = () => {
        
        if (this.dataSourceMeritoFinal.data.length == 0) {
            this.dataService.Message().msgWarning('No tiene que publicar.', () => { });
            return;
        }

        this.dataService.Message().msgConfirm("", () => {
            this.dataService.Spinner().show("sp6");
            let request = {
                idEtapaProceso: this.idEtapaProceso,
                usuarioModificacion: this.passport.numeroDocumento,
                codigoCentroTrabajoMaestro: this.passport.codigoSede,

            };
            this.dataService.Contrataciones().postPublicarFinalCalificacion(request).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message().msgSuccess("", () => {});
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService.Message().msgError("", () => { });
                        }
                    }
                });
        }, () => {});
    }

    handleCuadroMerito = () => {
        let idResultadoCalificacion = 0;
        if (this.selectTab == this.selectTabId.MeritoPreliminar) {
            idResultadoCalificacion = ResultadoCalificacionEnum.PRELIMINAR;
        } else if (this.selectTab == this.selectTabId.MeritoFinal) {
            idResultadoCalificacion = ResultadoCalificacionEnum.FINAL;
        } 

        this.dataService.Spinner().show("sp6");
        const requestGenerarPdf: any = {
            maestroProceso: this.etapaResponse.descripcionTipoProceso,
            idResultadoCalificacion: idResultadoCalificacion,
            anio: this.etapaResponse.anio,
            subInstancia: this.passport.nombreSede,
            usuarioCreacion: this.passport.numeroDocumento,
            idEtapaProceso: this.idEtapaProceso
        };

        this.dataService.Contrataciones().getGenerarPdfCuadroMeritoResultadosPUN(requestGenerarPdf).pipe(
            catchError((e) => of([e])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            let r = response[0];
            if (r == null) {
                const plazasFile = response.file;
                this.handleVerCuadroMerito(plazasFile);
            } else {
                if (r.status == ResultadoOperacionEnum.InternalServerError) {
                    this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                } else if (r.status == ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(r.message, () => { });
                } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                } else {
                    this.dataService.Message().msgError("", () => { });
                }
            }
        });
    }

    handleVerCuadroMerito(file: string) {
        if (!file) {
            this.dataService.Message().msgWarning('No se pudo generar el documento de cuadro de merito.', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(file).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('Error, no se pudo acceder al servicio.', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                this.handlePreview(response, "Cuadro_Merito_Resultados_PUN");
            } else {
                this.dataService.Message().msgWarning('No se pudo obtener el documento de cuadro de merito.', () => { });
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
                    title: "Cuadro de Merito Contratación Resultados PUN",
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

    handleExportarMerito = (idResultadoCalificacion) => {
        let nombre_excel = '';
        let dt;
        if (idResultadoCalificacion == ResultadoCalificacionEnum.PRELIMINAR) {
            nombre_excel = 'Preliminar';
            dt = this.dataSourceMeritoPreliminar.data;
        }
        if (idResultadoCalificacion == ResultadoCalificacionEnum.FINAL) {
            nombre_excel = 'Final';
            dt = this.dataSourceMeritoFinal.data;
        }

        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];

        nombre_excel = nombre_excel + '-Evaluacion_Expedientes-' + dateString + '.xlsx';
        this.handleExportar(idResultadoCalificacion, dt, nombre_excel);
    }

    handleExportar = (idResultadoCalificacion, dataSource: any[], nombreExcel: string) => {
        if (dataSource.length === 0) {
            this.dataService.Message().msgWarning("No se encontró información para exportar.",
                () => {}
            );
            return;
        }

        this.setRequestExportar(idResultadoCalificacion);
        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().getExportarExcelContratacionResultadosEvalExpCalificaciones(this.requestExportar).pipe(
            catchError((e) => of([e])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, nombreExcel);
            } else {
                this.dataService.Message().msgWarning("NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.",
                    () => {}
                );
            }
        });
    }

    handleRequisitos = (d) => {
        let modoEdicion = d.estadoCalificacion == 'APTO'?1:0;
        debugger;

        var r: any;
        if (this.selectTab == this.selectTabId.MeritoPreliminar) {
            r = { ...this.requestMeritoPreliminar, paginaActual: this.paginatorMeritoPreliminar.pageIndex, tamanioPagina: this.paginatorMeritoPreliminar.pageSize };
        } else if (this.selectTab == this.selectTabId.MeritoFinal) {
            r = { ...this.requestMeritoFinal, paginaActual: this.paginatorMeritoFinal.pageIndex, tamanioPagina: this.paginatorMeritoFinal.pageSize };
        } 
        this.localStorageService.setItem('_filtrosTmp', JSON.stringify(r));
        //this.router.navigate(['./registrar-calificacion/' + d.idCalificacion + '/' + d.idPersona], {
        this.router.navigate(['./registrar-calificacion/' + d.idCalificacion + '/' + d.idPersona+'/'+modoEdicion], {

            relativeTo: this.route,
        })
    } 

    handleObservar = (d) => {
        console.log('Observar : ', d)
        
        this.dialogRef = this.materialDialog.open(ModalObservarPostulacionPUNComponent, {
            panelClass: "modal-observar-postulacion-pun-dialog",
            width: "400px",
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

    handleInformacion = (d) => {
        console.log(d);
        var r: any;
        if (this.selectTab == this.selectTabId.MeritoPreliminar) {
            r = { ...this.requestMeritoPreliminar, paginaActual: this.paginatorMeritoPreliminar.pageIndex, tamanioPagina: this.paginatorMeritoPreliminar.pageSize };
        } else if (this.selectTab == this.selectTabId.MeritoFinal) {
            r = { ...this.requestMeritoFinal, paginaActual: this.paginatorMeritoFinal.pageIndex, tamanioPagina: this.paginatorMeritoFinal.pageSize };
        } 
        this.localStorageService.setItem('_filtrosTmp', JSON.stringify(r));
        this.router.navigate(['./informacion-calificacion/' + d.idCalificacion + '/' + d.idPersona], {
            relativeTo: this.route,
        })
    }

    handleReclamo = (d) => {
        console.log("Datos row: ",d);
        
        this.dialogRef = this.materialDialog.open(ModaRegistrarReclamoPUNComponent, {
            panelClass: "modal-registrar-reclamo-pun-dialog",
            width: "400px",
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

    handleRetornar = () => {
        this.router.navigate(["../../../"], { relativeTo: this.route.parent });
    };

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    handleGenerarOrdenMerito = (dtSource, idResultadoCalificacion) => {
        if (dtSource.data.length == 0) {
            this.dataService.Message().msgWarning('No tiene que generar orden.', () => { });
            return;
        }

        this.dataService.Message().msgConfirm(
            '¿ESTA SEGURO QUE DESEA GENERAR ORDEN DE MERITO?',
            () => {
                this.dataService.Spinner().show("sp6");
                
                let request = {
                    idEtapaProceso: this.idEtapaProceso,
                    idResultadoCalificacion: idResultadoCalificacion,
                    usuarioModificacion: this.passport.numeroDocumento,
                    codigoCentroTrabajoMaestro:this.passport.codigoSede
                };

                this.dataService.Contrataciones().postOrdenMeritoCalificacion(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton("",3000, () => {});
                        this.handleBuscar();
                        this.obtenerEstadoDesarrolloEtapa();
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService.Message().msgError("", () => { });
                        }
                    }                     
                });
            }
        );
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
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Evaluacion");
        this.sharedService.setSharedTitle("Calificaciones");
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
                    .get("idTipoDocumento")
                    .setValue(servidorPublico.idTipoDocumentoIdentidad);
                this.form
                    .get("numeroDocumentoIdentidad")
                    .setValue(servidorPublico.numeroDocumentoIdentidad);
            }
        });
    }
}

export class CuadroMeritoPreliminarPUNDataSource extends DataSource<any> {
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
            this.dataService.Contrataciones().getBuscarMeritoEvalExpPaginado(data, pageIndex, pageSize).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((d: any) => {
                console.log("response preliminar", d)
                this._dataChange.next(d || []);
                this.totalregistro = (d || []).length === 0 ? 0 : d[0].total_registros;
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
}

export class CuadroMeritoFinalPUNDataSource extends DataSource<any> {
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
            this.dataService.Contrataciones().getBuscarMeritoEvalExpPaginado(data, pageIndex, pageSize).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((d: any) => {
                console.log("response final", d)
                this._dataChange.next(d || []);
                this.totalregistro = (d || []).length === 0 ? 0 : d[0].total_registros;
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
}


interface ControlesActivosCalificacion{
    btnRealizarCalificacion:boolean,
    btnObservarPostulante:boolean,
    btnRegistrarReclamo:boolean,
    btnPublicarResultadoPreliminar: boolean,
    btnPublicarResultadoFinal:boolean,
    btnCargaMassiva:boolean
    btnGenerarOrdenMerito:boolean,
    btnPublicarCuadroMeritoPreliminar:boolean,
    btnPublicarCuadroMeritoFinal:boolean
}
