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
import { BusquedaPlazaComponent } from "../../components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { CatalogoItemEnum, TipoFormatoPlazaEnum, EstadoAdjudicacionEnum, TipoAccionEnum, FlujoEstadoEnum, MensajesSolicitud } from "../../_utils/constants";
import { BuscadorServidorPublicoComponent } from "../../components/buscador-servidor-publico/buscador-servidor-publico.component";
import { descargarExcel } from "app/core/utility/functions";
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from "app/core/model/messages-error";
import { ComboDefault } from "app/core/model/types";
import { ModalInformacionCompletaComponent } from "./modal-informacion-completa/modal-informacion-completa.component";
import { ModalNoAdjudicarComponent } from "./modal-no-adjudicar/modal-no-adjudicar.component";
import { ModalVerObservacionAdjudicacionComponent } from "./modal-ver-observacion/modal-ver-observacion.component";
import { ModalSubsanarObservacionComponent } from "./modal-subsanar-observacion/modal-subsanar-observacion.component";
import { ModalVerSubsanacionComponent } from "./modal-ver-subsanacion/modal-ver-subsanacion.component";
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { SecurityModel } from "app/core/model/security/security.model";
import { EtapaResponseModel } from "../../models/contratacion.model";
import { ModalContratoAdjudicacionDirectaComponent } from "./modal-contrato-adjudicacion-directa/modal-contrato-adjudicacion-directa.component";
import { modalPostulante } from '../../models/modalPostulante';
import { criterioBusqueda } from '../../models/criterioBusqueda.model';
import { RegimenLaboralEnum } from '../../../reasignacion/_utils/constants';
import { bandejaAdjudicacionModel } from '../../models/bandejaAdjudicacion.model';

@Component({
    selector: 'minedu-bandeja-adjudicaciones',
    templateUrl: './bandeja-adjudicaciones.component.html',
    styleUrls: ['./bandeja-adjudicaciones.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class BandejaAdjudicacionesComponent implements OnInit {
    anioEtapaProceso:number=0;
    maxLengthnumeroDocumentoIdentidad: number;
    modalPostulante:modalPostulante = new modalPostulante();
    bandejaAdjudicacion:bandejaAdjudicacionModel = new bandejaAdjudicacionModel()
    form: FormGroup;
    idEtapaProceso: number;
    estadoDesarrollo:any;
    adjudicacionFinalizada:any;
    adjudicacionTotal:number = 0;
    codigoSede:any;
    dialogRef: any;
    estadoPlaza = 0;
    becario: string;
    isMobile = false;
    tipoDocumentos: any[] = [];
    estados: any[] = [];
    plazaFiltroSeleccionado: any;
    centroTrabajoFiltroSeleccionado: any;
    idServidorPublicoSelected: number;
    paginatorAdjudicacionesPageIndex = 0;
    paginatorAdjudicacionesPageSize = 10;
    estadoAjudicacion = EstadoAdjudicacionEnum;
    @ViewChild("paginatorAdjudicaciones", { static: true }) paginatorAdjudicaciones: MatPaginator;
    dataSourceAdjudicaciones: PlazasContratacionAdjudicacionesDataSource | null;
    displayedColumnsAdjudicaciones: string[] = [
        "registro",
        "documento",
        "apellidos_nombres",
        "codigo_plaza",
        "cargo",
        "centro_trabajo",
        "modalidad_educativa",
        "nivel_educativo",
        "estado",
        "acciones",
    ];
    etapaResponse: EtapaResponseModel;
    request = {
        idEtapaProceso: null,
        idTipoDocumento: null,
        numeroDocumento: null,
        idEstadoAdjudicacion: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        codigoCentroTrabajoMaestro:null
    };
    firstTime = true;
    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.buildForm();
        this.buildGrids();
        this.getEstados();
        this.handleResponsive();
        this.getDocumentoTipos();
        this.obtenerEtapa();
        this.buildSeguridadControles();

        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.codigoSede = this.currentSession.codigoSede;

        this.obtenerEstadoDesarrolloEtapa();
	this.obtenerFlujoEstado();
    }

    ngAfterViewInit() {
        this.paginatorAdjudicaciones.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();
    }

    obtenerEstadoDesarrolloEtapa = () => {
        let idProcesoEtapa = this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;

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
		    this.adjudicacionTotal = response.adjudicacionTotal;
		    this.bandejaAdjudicacion.asignarEstadoFinalizada(response.adjudicacionFinalizada);
		    this.bandejaAdjudicacion.asignarCodigoEstadoDesarrollo(response.codigoEstadoDesarrollo);
                }
            console.log("Estado de desarrollo : ", this.estadoDesarrollo);
            });
    };

    buildForm(): void {
        this.form = this.formBuilder.group({
            tipoDocumento: [null],
            numeroDocumentoIdentidad: [null],
            codigoPlaza: [null],
            codigoCentroTrabajo: [null],
            estado: [null]
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


    buildGrids(): void {
        this.dataSourceAdjudicaciones = new PlazasContratacionAdjudicacionesDataSource(this.dataService);
        this.buildPaginators(this.paginatorAdjudicaciones);
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

    getEstados() {
        this.dataService.Contrataciones().getComboTipoDocumentos(CatalogoItemEnum.ESTADO_ADJUDICACION).pipe(
            catchError(() => {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.ESTADOS_POSTULANTE, SNACKBAR_BUTTON.CLOSE);
                return of(null);
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.estados = response;
		this.form.get('estado').setValue('-1');
            } else {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.ESTADOS_POSTULANTE, SNACKBAR_BUTTON.CLOSE);
                this.tipoDocumentos = [];
            }
        });
    }

    getDocumentoTipos() {
        this.dataService.Contrataciones().getComboTipoDocumentos(CatalogoItemEnum.TIPOS_DOCUMENTOS_IDENTIDAD).pipe(
            catchError(() => {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD, SNACKBAR_BUTTON.CLOSE);
                return of(null);
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.tipoDocumentos = response;
		this.form.get('tipoDocumento').setValue('-1');
            } else {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.TIPOS_DOCUMENTOS_IDENTIDAD, SNACKBAR_BUTTON.CLOSE);
                this.tipoDocumentos = [];
            }
        });
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
    

   
    handleContratosAdjudicacion = (d) => {
        console.log("Data Row: ",d)
        this.dataService.Spinner().show("sp6");
        this.dialogRef = this.materialDialog.open(ModalContratoAdjudicacionDirectaComponent,
            {
                panelClass: "modal-contrato-adjudicacion-directa-dialog",
                width: "100%",
                disableClose: true,
                data: {
                    adjudicacion: d,
                    etapaResponse: this.etapaResponse,
                    passport: this.currentSession
                },
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
                this.form.get("tipoDocumento").setValue(servidorPublico.idTipoDocumentoIdentidad);
                this.form.get("numeroDocumentoIdentidad").setValue(servidorPublico.numeroDocumentoIdentidad);
            }
        });
    }

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
		codigoCentroTrabajo: this.currentSession.codigoSede
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigo_plaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1900px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                    idEtapaProceso: this.idEtapaProceso,
                    codigoSede : this.currentSession.codigoSede
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

    setRequest() {
        const formulario = this.form.getRawValue();
        
        let idTipoDocumento = this.form.value.tipoDocumento == ComboDefault.ValueTodos ? null : this.form.value.tipoDocumento;
        let numeroDocumento = formulario.numeroDocumentoIdentidad ? formulario.numeroDocumentoIdentidad : null;
        let idEstado = this.form.value.estado == ComboDefault.ValueTodos ? null : this.form.value.estado;
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
            codigoCentroTrabajoMaestro : this.currentSession.codigoSede
        };
    }
    handleBuscarPaginator = () => {
        this.setRequest();

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

        this.dataSourceAdjudicaciones.load(this.request, this.paginatorAdjudicaciones.pageIndex + 1, this.paginatorAdjudicaciones.pageSize,this.firstTime);
        this.firstTime = false;
    }

    handleBuscar() {
	this.paginatorAdjudicaciones.firstPage();
	this.handleBuscarPaginator();
    }

    handleVerInformacion = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionCompletaComponent, {
            panelClass: "modal-informacion-completa-dialog",
            width: "950px",
            disableClose: true,
            data: dataPostulante,
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                return;                
            }
        });
    }

    handleAdjudicarPlaza = (dataPostulante) => {
        this.router.navigate(
            [
                "./adjudicar-plaza/" + dataPostulante.id_adjudicacion+ "/" + this.anioEtapaProceso + "/"+ this.idEtapaProceso
            ],
            {
                relativeTo: this.route,
            }
        );

	//let data = {
	     //...dataPostulante,
	     //anio:this.anioEtapaProceso
	//};
        //this.dialogRef = this.materialDialog.open(ModalAdjudicarPlazaComponent, {
            //panelClass: "modal-adjudicar-plaza-dialog",
            //width: "1000px",
            //disableClose: true,
            //data: data
        //});
//
        //this.dialogRef.afterClosed().subscribe((response: any) => {
            //if (response) {
                //this.handleBuscar();
            //} else {
                //return;              
            //}
        //});
    }

    handleNoAdjudicarPlaza = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalNoAdjudicarComponent, {
            panelClass: "modal-no-adjudicar-dialog",
            width: "600px",
            disableClose: true,
            data: dataPostulante
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });
    }

    handleVerObservacion = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalVerObservacionAdjudicacionComponent, {
            panelClass: "modal-ver-observacion-dialog",
            width: "600px",
            disableClose: true,
            data: dataPostulante
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                return;
            }
        });
    }

    handleSubsanarObservacion = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalSubsanarObservacionComponent, {
            panelClass: "modal-subsanar-observacion-dialog",
            width: "600px",
            disableClose: true,
            data: dataPostulante
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });
    }

    handleVerSubsanacionObservacion = (dataPostulante) => {
        this.dialogRef = this.materialDialog.open(ModalVerSubsanacionComponent, {
            panelClass: "modal-ver-subsanacion-dialog",
            width: "600px",
            disableClose: true,
            data: dataPostulante
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                return;
            }
        });
    }

    handleFinalizarAdjudicacion = () => {
	this.setRequest();
	let requestVerificarEstado = {
	    ...this.request,
	    codigoEstadoAdjudicacion : EstadoAdjudicacionEnum.PENDIENTE
	}
	this.dataService
	    .Contrataciones()
	    .getVerificarExisteEstado(requestVerificarEstado)
	    .subscribe(x => {
		if(x){
		return this.dataService
			.Message()
			.msgWarning('"NO SE PUEDE FINALIZAR LA ADJUDICACIÓN, YA QUE AÚN TIENE POSTULANTES PENDIENTES PARA SU ADJUDICACIÓN"');
		}
		procesarFinalizarAdjudicacion();
	    });

	    let procesarFinalizarAdjudicacion = () => {
		this.dataService
		    .Message()
		    .msgConfirm('¿ESTÁ SEGURO DE QUE DESEA FINALIZAR LA ADJUDICACIÓN?', 
		 () => {            
		    let d = {
			idEtapaProceso: this.idEtapaProceso,
			usuarioModificacion: "ADMIN",
			codigoCentroTrabajoMaestro : this.currentSession.codigoSede,
			idFlujoEstado: this.bandejaAdjudicacion.getIdFlujoEstado()
		    };

		    this.dataService.Spinner().show("sp6");
		    this.dataService
		        .Contrataciones()
			.postFinalizarAdjudicacion(d)
			.pipe(
			      catchError((e) => of([e])),
			      finalize(() => { this.dataService.Spinner().hide("sp6"); })
			     )
		       .subscribe((response: any) => {
			   if (response > -1) {
			       this.dataService.Message().msgAutoCloseSuccessNoButton(MensajesSolicitud.M07,3000, () => {});
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
    }

    handleFinalizarEtapa = () => {
	this.setRequest();
	let requestVerificarEstado = {
	    ...this.request,
	    codigoEstadoAdjudicacion : EstadoAdjudicacionEnum.OBSERVADO
	}
	this.dataService
	    .Contrataciones()
	    .getVerificarExisteEstado(requestVerificarEstado)
	    .subscribe(x => {
		if(x){
		return this.dataService
			.Message()
			.msgWarning('"NO SE PUEDE FINALIZAR LA ADJUDICACIÓN, YA QUE AÚN TIENE POSTULANTES PENDIENTES PARA SU ADJUDICACIÓN"');
		}
		procesarFinalizacionEtapa();
	    });

	    let procesarFinalizacionEtapa = () =>{
		this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA FINALIZAR LA ETAPA?', () => {
		    this.currentSession = this.dataService.Storage().getInformacionUsuario();
		    let d = {
			idEtapaProceso: this.idEtapaProceso,
			usuarioModificacion: "ADMIN",
			codigoCentroTrabajoMaestro : this.currentSession.codigoSede,
			idFlujoEstado : this.bandejaAdjudicacion.getIdFlujoEstado()
		    };

		    this.dataService.Spinner().show("sp6");
		    this.dataService.Contrataciones()
			.postFinalizarEtapa(d)
			.pipe(catchError((e) => of([e])),
			finalize(() => {
			    this.dataService.Spinner().hide("sp6");
			}))
		    .subscribe((response: any) => {
			if (response > -1) {
			    this.dataService.Message()
				.msgAutoCloseSuccessNoButton(MensajesSolicitud.M07,3000, () => {});
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
    }

    handleExportarAdjudicaciones = () => {
        if (this.dataSourceAdjudicaciones.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',
                () => {}
            );
            return;
        }
        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        var nombreExcel = "Contratacion_Directa_Adjudicaciones";
        try{
            var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = nombreExcel+"" + ".xlsx";
        }
        // ************************************************************************************************

        this.setRequest();
        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelContratacionDirectaAdjudicaciones(this.request).pipe(
            catchError((e) => of([e])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response.file) {
                descargarExcel(response.file, nombreExportar);//'Contratacion_Directa_Adjudicaciones.xlsx'
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
            }
        });
    }

    handleLimpiar() {
        this.form.reset();
        this.form.get('numeroDocumentoIdentidad').disable();
	this.form.get('estado').setValue('-1');
	this.form.get('tipoDocumento').setValue('-1');
        this.firstTime = true;
	this.handleBuscar();
    }

    handleRetornar = () => {
        this.router.navigate(["../../../"], { relativeTo: this.route });
    };

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Directa");
        this.sharedService.setSharedTitle("Adjudicaciones");
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
    onEventDataInfor = (event) => {
	this.anioEtapaProceso = event.anio;
    }
    obtenerFlujoEstado (){
	let data = {
	    idEtapaProceso: this.idEtapaProceso,
	    codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
	    codigoTipoAccion: TipoAccionEnum.ADJUDICACION,
	    codigoEstadoInformacion: FlujoEstadoEnum.PENDIENTE,
	}
	this.dataService.Contrataciones()
	.getFlujoEstado(data)
	.pipe(
	    catchError(() => { return of(null); })
	)
	.subscribe(this.bandejaAdjudicacion.setFlujoEstado);
    }
}

export class PlazasContratacionAdjudicacionesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(
	private dataService: DataService
    ) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime = false): void {
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Contrataciones().getBuscarContratacionDirectaAdjudicacionPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((adjudicaciones: any) => {
                this._dataChange.next(adjudicaciones || []);
                this.totalregistro = (adjudicaciones || []).length === 0 ? 0 : adjudicaciones[0].total_registros;
                if (((adjudicaciones || []).length === 0 || this.totalregistro === 0) && !firstTime) {
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
interface ControlesActivosAdjudicacion{
    btnFinalizarAdjudicacion:boolean,
    btnFinalizarEtapa:boolean,
    btnAdjudicarPlaza:boolean,
    btnNoAdjudicarPlaza: boolean,
    btnSubsanarObservacion:boolean,
    btnExportar:boolean,
}
