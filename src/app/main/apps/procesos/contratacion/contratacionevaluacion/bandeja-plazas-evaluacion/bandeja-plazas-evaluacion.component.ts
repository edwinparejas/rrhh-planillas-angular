import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { SharedService } from "../../../../../../core/shared/shared.service";
import { BehaviorSubject, of, Observable } from "rxjs";
import { BusquedaPlazaComponent } from "../../components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { catchError, finalize, tap } from "rxjs/operators";
import { SituacionPlazasEnum, TipoFormatoPlazaEnum, CatalogoItemEnum, ResultadoFinalEnum, EstadoValidacionPlazaEnum, GrupoDocumentoPublicadoEnum, CodigoDocumentoContratacionEnum } from '../../_utils/constants';
import { EtapaResponseModel } from '../../models/contratacion.model';
import { descargarExcel } from "app/core/utility/functions";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { saveAs } from 'file-saver';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { ComboDefault } from '../../../../../../core/model/types';
// import { MensajesSolicitud } from '../../../../bandejas/solicitudesatenciones/atenciones/gestion-atenciones/_utils/constants';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { ModalDocumentosPublicadosComponent } from '../../components/modal-documentos-publicados/modal-documentos-publicados.component';
import { ModalInformacionPlazaEvalExpComponent } from "./modal-informacion-plaza-eval-exp/modal-informacion-plaza-eval-exp.component";
import { ModalPlazaObservadaEvalExpComponent } from "./modal-plaza-observada-eval-exp/modal-plaza-observada-eval-exp.component";
import { ModalIncorporacionPlazasEvalExpComponent } from "./modal-incorporacion-plazas-eval-exp/modal-incorporacion-plazas-eval-exp.component";
import { CodigoCentroTrabajoMaestroEnum, RegimenLaboralEnum } from '../../../reasignacion/_utils/constants';
import { ModalPlazaObservadaComponent } from "../../validacionplaza/modal-plaza-observada/modal-plaza-observada.component";
import { criterioBusqueda } from '../../models/criterioBusqueda.model';

@Component({
    selector: 'minedu-bandeja-plazas-evaluacion',
    templateUrl: './bandeja-plazas-evaluacion.component.html',
    styleUrls: ['./bandeja-plazas-evaluacion.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class BandejaPlazasEvaluacionComponent implements OnInit {
    firstTime = true;

    selectedTabIndex = 0;
    soloLectura = true;
    validacionPlaza = '';
    btnPublicar = false;
    btnAperturar = false;
    form: FormGroup;
    idEtapaProceso: number;
    codSedeCabecera:string;

    mostrarResultadoFinal:boolean = false;
    plazasPublicadas: boolean = false;

    isSeleccionadoTodosDesiertas: boolean = false;
    noSeleccionadosDesiertas: any[] = [];
    totalSeleccionadosDesiertas: number = 0;
    
    totalSeleccionadosConvocar: number = 0;
    totalSeleccionadosObservadas: number = 0;

    dialogRef: any;
    selectTab = 0;
    selectTabId = {
        PlazasDesiertas: 0,
        PlazasConvocar: 1,
        PlazasObservadas: 2,
        PlazasResultadoFinal: 3
    }
    isMobile = false;
    plazaFiltroSeleccionado: any;
    paginatorPlazasDesiertasPageIndex = 0;
    paginatorPlazasDesiertasPageSize = 10;
    paginatorPlazasConvocarPageIndex = 0;
    paginatorPlazasConvocarPageSize = 10;
    paginatorPlazasObservadasPageIndex = 0;
    paginatorPlazasObservadasPageSize = 10;
    paginatorPlazasResultadoFinalPageIndex = 0;
    paginatorPlazasResultadoFinalPageSize = 10;
    @ViewChild("paginatorPlazasDesiertas", { static: true }) paginatorPlazasDesiertas: MatPaginator;
    @ViewChild("paginatorPlazasConvocar", { static: true }) paginatorPlazasConvocar: MatPaginator;
    @ViewChild("paginatorPlazasObservadas", { static: true }) paginatorPlazasObservadas: MatPaginator;
    @ViewChild("paginatorPlazasResultadoFinal", { static: true }) paginatorPlazasResultadoFinal: MatPaginator;
    etapaResponse: EtapaResponseModel;
    plazaContratacion;
    centroTrabajoFiltroSeleccionado: any;
    dataSourceMemoryIncorporadas: any[] = [];
    plazasSeleccionadas: any[] = [];
    dataSourceDesiertas: PlazasEvalExpDataSource | null;
    dataSourceConvocar: PlazasEvalExpDataSource | null;
    dataSourceObservadas: PlazasEvalExpDataSource | null;
    dataSourceResultadoFinal: PlazasEvalExpDataSource | null;
    displayedColumnsPlazasDesiertas: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "acciones"
    ];
    displayedColumnsPlazasConvocar: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "acciones"
    ];
    displayedColumnsPlazasObservadas: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "acciones"
    ];
    displayedColumnsPlazasResultadoFinal: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "estado",
        "acciones"
    ];
    selectionPlazasDesiertas = new SelectionModel<any>(true, []);
    selectionPlazasConvocar = new SelectionModel<any>(true, []);
    selectionPlazasObservadas = new SelectionModel<any>(true, []);
    
    request = {
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idEtapaProceso: null,
        idSituacionValidacion: null,
        codigoCentroTrabajoMaestro:null,
    };
    ResultadoFinalEnum = ResultadoFinalEnum;
    private passport: SecurityModel = new SecurityModel();

    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        if (this.route.routeConfig.path.search('ver-contratacion-evaluacion-expediente/') > -1) {
            this.soloLectura = true;
        } else {
            this.soloLectura = false;
        }
        this.passport = this.dataService.Storage().getInformacionUsuario();
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.buildForm();
        this.iniCombos();
        this.buildGrids();
        this.handleResponsive();
        this.obtenerEtapa();
        this.obtenerPlazaContratacion();

        this.buildSeguridadControles();
        this.codSedeCabecera = this.passport.codigoSede;
    }

    ngAfterViewInit() {
        this.paginatorPlazasDesiertas.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();
        this.paginatorPlazasConvocar.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();
        this.paginatorPlazasObservadas.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();
        this.paginatorPlazasResultadoFinal.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();

        this.handleBuscar();
    }

    iniCombos(): void{
             
    }

    controlesActivos:ControlesActivos = {
        btnFinalizarValidacionPlazas:false, btnPublicarPlazas:false, btnAperturarPublicacion:false, btnIncorporarPlazas: false, btnPlazasConvocar:false, btnPlazasObservadas:false, btnVerPlazasPDF:false, btnExportar:false, btnEliminarPlazas:false   
    }
    buildSeguridadControles = () => {
        const rol = this.dataService.Storage().getPassportRolSelected();
        // Ajustar Valores
        this.passport.idRol = 0;  
        switch(rol.CODIGO_TIPO_SEDE){
            case "TS001":
                this.passport.idTipoSede = 2;              
                if(rol.CODIGO_ROL == "AYNI_004")
                    this.passport.idRol = 5; // Resp. DRE   
                break;
            case "TS002":
                this.passport.idTipoSede = 3;
                if(rol.CODIGO_ROL == "AYNI_004")
                    this.passport.idRol = 6; // Resp UGEL
                break;
            case "TS004":
                this.passport.idTipoSede = 4;
                if(rol.CODIGO_ROL == "AYNI_004") 
                    this.passport.idRol = 7; // Resp. IE Militar
                break;
            case "TS005":
                this.passport.idTipoSede = 1;
                if(rol.CODIGO_ROL == "AYNI_006")
                    this.passport.idRol = 2; // Esp Diten
                if(rol.CODIGO_ROL == "AYNI_004") 
                    this.passport.idRol = 5; // Resp. DRE
                break;
            case "TS013":
                this.passport.idTipoSede = 1;
                if(rol.CODIGO_ROL == "AYNI_019")
                    this.passport.idRol = 9; // Esp Diten
                break;    
            default:
                if(rol.CODIGO_ROL == "AYNI_006")
                    this.passport.idRol = 2; // Monitor
                break;
        }

        const data = { 
            idEtapaProceso:this.idEtapaProceso, 
            codTipoSede:this.passport.codigoTipoSede,
            codRol:this.passport.codigoRol
        }

        console.log("Datos entrada seguridad: ",data);
        this.dataService.Contrataciones().getObtenerAccesoUsuariosValidacionPlazas(data).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                console.log("Valores de tabla accesos: ",response)
                this.controlesActivos = { 
                    btnFinalizarValidacionPlazas:response.finalizarValidacionPlazas,
                    btnPublicarPlazas:response.publicarPlazas, 
                    btnAperturarPublicacion:response.aperturarPrepublicacion, 
                    btnIncorporarPlazas: response.incorporarPlazas,
                    btnPlazasConvocar:response.plazasConvocar, 
                    btnPlazasObservadas:response.plazasObservadas, 
                    btnVerPlazasPDF:true, 
                    btnExportar:true, 
                    btnEliminarPlazas:response.incorporarPlazas
                 }; 
            }
        });       

    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoCentroTrabajo: [null],
            codigoPlaza: [null]
        });
    }

    buildGrids(): void {
        this.dataSourceDesiertas = new PlazasEvalExpDataSource(this.dataService);
        this.dataSourceConvocar = new PlazasEvalExpDataSource(this.dataService);
        this.dataSourceObservadas = new PlazasEvalExpDataSource(this.dataService);
        this.dataSourceResultadoFinal = new PlazasEvalExpDataSource(this.dataService);
        this.buildPaginators(this.paginatorPlazasDesiertas);
        this.buildPaginators(this.paginatorPlazasConvocar);
        this.buildPaginators(this.paginatorPlazasObservadas);
        this.buildPaginators(this.paginatorPlazasResultadoFinal);
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

    handleLimpiar(): void {
        this.resetForm();
    }

    resetForm = () => {
        this.form.reset();
    };

    handleBuscarPaginator = () => this.ObtenerDataParaGrilla();
    handleBuscar = () => {
	this.paginatorPlazasDesiertas.firstPage();
	this.paginatorPlazasConvocar.firstPage();
	this.paginatorPlazasObservadas.firstPage();
	this.paginatorPlazasResultadoFinal.firstPage();
	this.ObtenerDataParaGrilla();
    }

    private ObtenerDataParaGrilla = () =>{
        this.setRequest();

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
        if(this.firstTime) 
	{
	    this.buscarPlazasDesiertas();
	    this.buscarPlazasConvocar();
	    this.buscarPlazasObservadas();
	    this.buscarPlazasResultadoFinal();
	}
        else{
            if (this.selectTab == this.selectTabId.PlazasDesiertas) {
                this.buscarPlazasDesiertas();
            }
            if (this.selectTab == this.selectTabId.PlazasConvocar) {
                this.buscarPlazasConvocar();
            }
            if (this.selectTab == this.selectTabId.PlazasObservadas) {
                this.buscarPlazasObservadas();
            }
            if (this.selectTab == this.selectTabId.PlazasResultadoFinal) {
                this.buscarPlazasResultadoFinal();
            }
        }
        this.firstTime = false;

    }

    handleSelectTab = (e) => {
        this.firstTime = true;
        this.selectedTabIndex = e.index;
        this.resetForm();
        this.handleBuscar();
        this.firstTime = false;
    };

    private buscarPlazasDesiertas = () => {
        this.request.idSituacionValidacion = SituacionPlazasEnum.PRE_PUBLICADA;
        this.dataSourceDesiertas.load(this.request, this.paginatorPlazasDesiertas.pageIndex + 1, this.paginatorPlazasDesiertas.pageSize,this.firstTime);
    };
    private buscarPlazasConvocar = () => {
        this.request.idSituacionValidacion = SituacionPlazasEnum.A_CONVOCAR;
        this.dataSourceConvocar.load(this.request, this.paginatorPlazasConvocar.pageIndex + 1, this.paginatorPlazasConvocar.pageSize,this.firstTime);
    };
    private buscarPlazasObservadas = () => {
        this.request.idSituacionValidacion = SituacionPlazasEnum.OBSERVADA;
        this.dataSourceObservadas.load(this.request, this.paginatorPlazasObservadas.pageIndex + 1, this.paginatorPlazasObservadas.pageSize,this.firstTime);
    };
    private buscarPlazasResultadoFinal = () => {
        this.request.idSituacionValidacion = SituacionPlazasEnum.PUBLICADO;
        this.dataSourceResultadoFinal.load(this.request, this.paginatorPlazasResultadoFinal.pageIndex + 1, this.paginatorPlazasResultadoFinal.pageSize,this.firstTime);
    };

    setRequest() {
        const formulario = this.form.getRawValue();

        let codigoPlaza = formulario.codigoPlaza ? formulario.codigoPlaza : null;
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo ? formulario.codigoCentroTrabajo : null;
        let idSituacionValidacion = 0;

        switch (this.selectTab) {
            case this.selectTabId.PlazasDesiertas:
                idSituacionValidacion = SituacionPlazasEnum.PRE_PUBLICADA;
                break;
            case this.selectTabId.PlazasConvocar:
                idSituacionValidacion = SituacionPlazasEnum.A_CONVOCAR;
                break;
            case this.selectTabId.PlazasObservadas:
                idSituacionValidacion = SituacionPlazasEnum.OBSERVADA;
                break;
            case this.selectTabId.PlazasResultadoFinal:
                idSituacionValidacion = SituacionPlazasEnum.PUBLICADO;
                break;
        }

        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo,
            idSituacionValidacion: idSituacionValidacion,
            codigoCentroTrabajoMaestro:this.passport.codigoSede,
        };
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
                    codigoSede: this.passport.codigoSede,
                    idEtapaProceso: this.idEtapaProceso
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
                idEtapaProceso: this.idEtapaProceso,
		idRegimenLaboral:RegimenLaboralEnum.LEY_30328,
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

    handleAperturarPlaza = () => {
        let d = {
            idEtapaProceso: this.idEtapaProceso,
            usuarioModificacion: this.passport.numeroDocumento,
	    codigoCentroTrabajoMaestro: this.passport.codigoSede
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
                        // this.dataService.Message().msgSuccess(MensajesSolicitud.M07, () => {});
                        this.obtenerPlazaContratacion();
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
        }, () => {});
    }

    handleIncorporarPlazas() {
        //this.dialogRef = this.materialDialog.open(ModalIncorporacionPlazasEvalExpComponent, {
            //panelClass: "modal-incorporacion-plaza-eval-exp-dialog",
            //width: "100%",
            //disableClose: true,
            //data: {
                //idEtapaProceso: this.idEtapaProceso
            //},
        //});
//
        //this.dialogRef.afterClosed().subscribe((response: any) => {
            //if (response) {
                //this.plazasSeleccionadas = response.plazas;
                //this.buscarPlazasDesiertas();
            //} else {
                //return;
            //}
        //});
	//
        const data = {
            idEtapaProceso : this.idEtapaProceso,
            codigoCentroTrabajoMaestro:this.codSedeCabecera,
            fragmentoUrlRetornar:'bandeja-plazas'
        };

        this.router.navigate([
            "ayni",
            "personal",
            "procesospersonal",
            "procesos",
            "contratacion",
            "bandeja-incorporacion-plazas",
            "bandeja-incorporacion",
            this.idEtapaProceso.toString(),
            {
		codigoCentroTrabajoMaestro: data.codigoCentroTrabajoMaestro,
		fragmentoUrlRetornar:data.fragmentoUrlRetornar,
		idRegimen: RegimenLaboralEnum.LEY_30328,
                textosConcatenadosConGuion:encodeURIComponent('Incorporar Plazas-TextoComplemento'),
	    },
        ]);
    }

    handleExportarEvalExpDesiertas = () => {
        this.handleExportarPlazas(this.dataSourceDesiertas.data, "Contratacion_Evaluacion_Expedientes_Desiertas");
    }

    handleExportarEvalExpConvocar = () => {
        this.handleExportarPlazas(this.dataSourceConvocar.data, "Contratacion_Evaluacion_Expedientes_Convocar");
    }

    handleExportarEvalExpObservadas = () => {
        this.handleExportarPlazas(this.dataSourceObservadas.data, "Contratacion_Evaluacion_Expedientes_Observadas");
    }

    handleExportarEvalExpResultadoFinal = () => {
        this.handleExportarPlazas(this.dataSourceResultadoFinal.data, "Contratacion_Evaluacion_Expedientes_Resultado_Final");
    }

    handleExportarPlazas = (dataSource: any[], nombreExcel: string) => {
        if (dataSource.length === 0) {
            this.dataService.Message().msgWarning("No se encontró información para exportar.",
                () => {}
            );
            return;
        }

        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        try{
            var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = nombreExcel+ ".xlsx";
        }
        // ***********************************************************************************************

        this.setRequest();
        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().getExportarExcelContratacionEvalExp(this.request).pipe(
            catchError((e) => of([e])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, nombreExportar);
            } else {
                this.dataService.Message().msgWarning("No se encontró información para los criterios de búsqueda ingresado",
                    () => {}
                );
            }
        });
    }

    informacionPlazaView = (id) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPlazaEvalExpComponent,
            {
                panelClass: "modal-informacion-plaza-eval-exp-dialog",
                width: "1000px",
                disableClose: true,
                data: {
                    idPlaza: id,
                    idEtapaProceso: this.idEtapaProceso
                },
            }
        );
    }

    handlePublicarPlazas = () => {
        if (this.dataSourceConvocar.data.length == 0) {
            this.dataService.Message().msgWarning('No tiene plazas convocadas para publicar.', () => { });
            return;
        }

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
                        this.dataSourceMemoryIncorporadas = [];
                        this.handleBuscar();
                        this.obtenerPlazaContratacion();
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
    };

    handleVerListadoPlazas() {
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

    handleVerPlazasPublicadas(file: string) {
        if (!file) {
            this.dataService.Message().msgWarning('No se pudo generar el documento de plazas publicadas.', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(file).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('Error, no se pudo acceder al servicio.', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                this.handlePreview(response, "Plazas_Publicadas_Contratacion_Resultados_PUN");
            } else {
                this.dataService.Message().msgWarning('No se pudo obtener el documento de plazas publicadas.', () => { });
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
                    title: "Plazas Publicadas Contratación Resultados PUN",
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

    obtenerPlazaContratacion(): void {
        let d = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro : this.passport.codigoSede,
        }
        
        this.dataService
            .Contrataciones()
            .getObtenerPlazaContratacionPorIdEtapaProceso(d)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.plazaContratacion = response;
                    this.validacionPlaza = this.plazaContratacion[0].estadoValidacionPlaza;
                    console.log("validacion: ", this.validacionPlaza, response)
                    if (this.plazaContratacion[0].codigoEstadoValidacionPlaza == EstadoValidacionPlazaEnum.PENDIENTE ||
                    this.plazaContratacion[0].codigoEstadoValidacionPlaza == EstadoValidacionPlazaEnum.APERTURADO) {
                        this.btnPublicar = true;
                        }
                    else {
                        this.btnPublicar = false;
                    }
                    if (this.plazaContratacion[0].codigoEstadoValidacionPlaza == EstadoValidacionPlazaEnum.PUBLICADO) {
                        this.btnAperturar = true;
                    } else {
                        this.btnAperturar = false;
                    }
                }
            });
    }

    isAllSelectedPlazasDesiertas = () => {
        const numSelected = this.selectionPlazasDesiertas.selected.length;
        const numRows = this.dataSourceDesiertas.data.length;
        return numSelected === numRows;
    };

    masterTogglePlazasDesiertas = () => {
        if (this.isSeleccionadoTodosDesiertas == true)
            this.isSeleccionadoTodosDesiertas = false;
        else
            this.isSeleccionadoTodosDesiertas = true;

        if (this.isSeleccionadoTodosDesiertas) {
            this.selectionPlazasDesiertas.clear();
            this.noSeleccionadosDesiertas = [];
            this.dataSourceDesiertas.data.forEach(row => {
                this.selectionPlazasDesiertas.select(row)
            });
        } else {
            this.selectionPlazasDesiertas.clear();
            this.noSeleccionadosDesiertas = [];
        }

        this.changeTotalSeleccionadosDesiertas();
        // this.isAllSelectedPlazasDesiertas() ? this.selectionPlazasDesiertas.clear() : this.dataSourceDesiertas.data.forEach((row) =>
        //     this.selectionPlazasDesiertas.select(row)
        // );
    };

    changeTotalSeleccionadosDesiertas = () => {

        console.log("this.noSeleccionados     ", this.noSeleccionadosDesiertas);

        if (this.isSeleccionadoTodosDesiertas == true)
            this.totalSeleccionadosDesiertas = this.dataSourceDesiertas?.dataTotal- this.noSeleccionadosDesiertas?.length;
        else
            this.totalSeleccionadosDesiertas = this.selectionPlazasDesiertas?.selected?.length;
        console.log("this.totalSeleccionados     ", this.totalSeleccionadosDesiertas);

    }

    selectedRowDesiertas = (row) => {
        this.selectionPlazasDesiertas.toggle(row)
        if (this.isSeleccionadoTodosDesiertas) {
            const exist = this.selectionPlazasDesiertas.selected.find(x => x.idPlazaContratacionDetalle == row.idPlazaContratacionDetalle);
            if (exist == null) {
                this.agregarNoSeleccionadosDesiertos(row, true);
            } else {
                this.agregarNoSeleccionadosDesiertos(row, false);
            }
        }

        this.changeTotalSeleccionadosDesiertos();
    };

    changeTotalSeleccionadosDesiertos = () => {

        console.log("this.noSeleccionados     ", this.noSeleccionadosDesiertas);

        if (this.isSeleccionadoTodosDesiertas == true)
            this.totalSeleccionadosDesiertas = this.dataSourceDesiertas?.dataTotal- this.noSeleccionadosDesiertas?.length;
        else
            this.totalSeleccionadosDesiertas = this.selectionPlazasDesiertas?.selected?.length;
        console.log("this.totalSeleccionados     ", this.totalSeleccionadosDesiertas);

    }
    agregarNoSeleccionadosDesiertos = (row, estado: boolean) => {
        if (estado) {
            const exist = this.noSeleccionadosDesiertas.find(x => x.idPlazaContratacionDetalle == row.idPlazaContratacionDetalle);
            if (exist == null) {
                this.noSeleccionadosDesiertas.push(row);
            }
        } else {
            const seleccionados = Object.assign([], this.noSeleccionadosDesiertas);
            this.noSeleccionadosDesiertas = [];
            seleccionados.forEach(element => {
                if (element.idPlazaContratacionDetalle != row.idPlazaContratacionDetalle) {
                    this.noSeleccionadosDesiertas.push(row);
                }
            });
        }
    }

    checkboxLabelPlazasDesiertas(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasDesiertas() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasDesiertas.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    isAllSelectedPlazasConvocar = () => {
        const numSelected = this.selectionPlazasConvocar.selected.length;
        const numRows = this.dataSourceConvocar.data.length;
        return numSelected === numRows;
    };

    masterTogglePlazasConvocar = () => {
        this.isAllSelectedPlazasConvocar() ? this.selectionPlazasConvocar.clear() : this.dataSourceConvocar.data.forEach((row) =>
            this.selectionPlazasConvocar.select(row)
        );
    };

    checkboxLabelPlazasConvocar(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasConvocar() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasConvocar.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    isAllSelectedPlazasObservadas = () => {
        const numSelected = this.selectionPlazasObservadas.selected.length;
        const numRows = this.dataSourceObservadas.data.length;
        return numSelected === numRows;
    };

    masterTogglePlazasObservadas = () => {
        this.isAllSelectedPlazasObservadas() ? this.selectionPlazasObservadas.clear() : this.dataSourceObservadas.data.forEach((row) =>
            this.selectionPlazasObservadas.select(row)
        );
    };

    checkboxLabelPlazasObservadas(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasObservadas() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasObservadas.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    handleConvocar(selection) { // viene de plazas desiertas
        if (selection.selected.length === 0) {
            this.dataService.Message().msgWarning('Debe seleccionar como mínimo un registro de la grilla.', () => { });
            return;
        }

        const request = {
            idEtapaProceso: this.idEtapaProceso,
            usuarioModificacion: this.passport.numeroDocumento,
            plazas: selection.selected,
            codigoCentroTrabajoMaestro : this.passport.codigoSede,
            isSeleccionadoTodosDesiertas:this.isSeleccionadoTodosDesiertas
        };

        this.dataService.Message().msgConfirm('¿Esta seguro de que desea convocar plazas?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Contrataciones().putEvalExpConvocar(request).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            ).subscribe(response => {
                if (response > 0) {
                    // this.dataService.Message().msgInfo(MensajesSolicitud.M07, () => { });
                    this.selectionPlazasDesiertas.clear();
                    this.selectionPlazasObservadas.clear();
                    this.handleBuscar();
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    // this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                }
            });
        }, (error) => { });
    }

    handleObservadas(selection) {
        if (selection.selected.length === 0) {
            this.dataService.Message().msgWarning('Debe seleccionar como mínimo un registro de la grilla.', () => { });
            return;
        }

        this.handleObservarPlazasModal(selection.selected);


        // this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA OBSERVAR LAS PLAZAS?',
        //     () => {
        //         this.handleObservarPlazasModal(selection.selected);
        //         //this.handleObservarPlazasModalValidacion(selection.selected);
        //     }
        // );
    }

    handleObservarPlazasModalValidacion(seleccionados: any[]): void {
        this.dialogRef = this.materialDialog.open(ModalPlazaObservadaComponent, {
            panelClass: "modal-plaza-observada-dialog",
            width: "980px",
            disableClose: true,
            data: {
                plazasObservadas: seleccionados,
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.selectionPlazasConvocar.clear();
                this.handleBuscar();
            }
            // if (!response) {
            //     return;
            // } else {
            //     if (response.id !== "0") {
            //         this.observarPlazas(seleccionados);
            //         this.actualizarPlazaDocumentoSustento(seleccionados, response);
            //     } else {
            //         return;
            //     }
            // }
            // this.buscarPlazasContratacionObservadas();
        });
    }

    handleObservarPlazasModal(seleccionados: any[]): void {
        this.dialogRef = this.materialDialog.open(ModalPlazaObservadaEvalExpComponent, {
            panelClass: "modal-plaza-observada-eval-exp-dialog",
            width: "980px",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                numeroDocumento: this.passport.numeroDocumento,
                plazasObservadas: seleccionados,
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.selectionPlazasConvocar.clear();
                this.handleBuscar();
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

}

export class PlazasEvalExpDataSource extends DataSource<any> {
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
            this.dataService.Contrataciones().getBuscarPlazasPaginadoEvalExp(data, pageIndex, pageSize).pipe(
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
                    if ((response || []).length === 0 && !firstTime) {
                        this.dataService.Message().msgAutoCloseWarningNoButton('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',3000, () => {});
                    }
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
interface ControlesActivos{
    btnFinalizarValidacionPlazas:boolean,
    btnPublicarPlazas:boolean,
    btnAperturarPublicacion:boolean,
    btnIncorporarPlazas: boolean,
    btnPlazasConvocar:boolean,
    btnPlazasObservadas:boolean
    btnVerPlazasPDF:boolean,
    btnExportar:boolean,
    btnEliminarPlazas:boolean
    // btnFinalizarEtapa : boolean,
    // btnAperturaEtapa : boolean,
    // btnPrePublicarPlazas:boolean,
    // btnPlazaBecarios:boolean,
}
