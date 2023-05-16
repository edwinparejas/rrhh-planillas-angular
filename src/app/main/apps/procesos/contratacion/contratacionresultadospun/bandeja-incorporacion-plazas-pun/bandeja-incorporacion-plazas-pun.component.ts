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
import { catchError, finalize, tap } from "rxjs/operators";
import { ActivoFlagEnum, SituacionPlazasEnum, TipoFormatoPlazaEnum, CatalogoItemEnum, ResultadoFinalEnum, EstadoValidacionPlazaEnum, GrupoDocumentoPublicadoEnum, RegimenLaboralEnum, EstadoEtapaProcesoEnum, TipoAccionEnum, FlujoEstadoEnum } from '../../_utils/constants';
import { EtapaResponseModel } from '../../models/contratacion.model';
import { descargarExcel } from "app/core/utility/functions";
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";
import { saveAs } from 'file-saver';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { ModalInformacionPlazaPUNComponent } from './modal-informacion-plaza-pun/modal-informacion-plaza-pun.component';
import { ComboDefault } from '../../../../../../core/model/types';
// import { MensajesSolicitud } from '../../../../bandejas/solicitudesatenciones/atenciones/gestion-atenciones/_utils/constants';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { ModalDocumentosPublicadosComponent } from '../../components/modal-documentos-publicados/modal-documentos-publicados.component';
import { criterioBusqueda } from '../../models/criterioBusqueda.model';
import { bandejaPlazaPUNModel } from '../../models/bandejaPlazaPUN.model';

@Component({
    selector: 'minedu-bandeja-incorporacion-plazas-pun',
    templateUrl: './bandeja-incorporacion-plazas-pun.component.html',
    styleUrls: ['./bandeja-incorporacion-plazas-pun.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class BandejaIncorporacionPlazasPUNComponent implements OnInit {
    plazaContratacion:any;
    soloLectura = true;
    form: FormGroup;
    idEtapaProceso: number;
    idEstadoDesarrollo: number;
    anio:any;
    firstTime = true;
    codigoSede:any;
    dialogRef: any;
    selectTab = 1;
    selectTabId = {
        IncorporacionPlaza: 0,
        PlazasPublicadas: 1,
        ResultadoFinal: 2
    }
    comboLists = {
        listEstado: [],
    };
    isMobile = false;
    btnPublicar = false;
    btnAperturar = false;
    selectedTabIndex = 0;
    plazaFiltroSeleccionado: any;
    paginatorPlazasIncorporadasPageIndex = 0;
    paginatorPlazasIncorporadasPageSize = 10;
    paginatorPlazasPublicadasPageIndex = 0;
    paginatorPlazasPublicadasPageSize = 10;
    paginatorResultadoFinalPageIndex = 0;
    paginatorResultadoFinalPageSize = 10;
    @ViewChild("paginatorPlazasIncorporadas", { static: true }) paginatorPlazasIncorporadas: MatPaginator;
    @ViewChild("paginatorPlazasPublicadas", { static: true }) paginatorPlazasPublicadas: MatPaginator;
    @ViewChild("paginatorResultadoFinal", { static: true }) paginatorResultadoFinal: MatPaginator;
    etapaResponse: EtapaResponseModel;
    centroTrabajoFiltroSeleccionado: any;
    plazasSeleccionadas: any[] = [];
    dataSourcePersistentIncorporadas: string;
    dataSourceIncorporadas: PlazasContratacionPUNDataSource | null;
    dataSourcePublicadas: PlazasContratacionPUNDataSource | null;
    dataSourceResultadoFinal: PlazasContratacionPUNDataSource | null;
    displayedColumnsPlazasIncorporadas: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        //"modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "acciones",
    ];
    displayedColumnsPlazasPublicadas: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        //"modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "fecha_publicacion",
        "acciones",
    ];
    displayedColumnsResultadoFinal: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
        //"modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        "area_curricular",
        "tipo_plaza",
        "vigencia_inicio",
        "vigencia_fin",
        "estado",
        "acciones",
    ];
    request = {
        idPlaza: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idEtapaProceso: null,
        idSituacionValidacion: null,
        plazasPublicar: null,
        idResultadoFinal: null,
        codigoCentroTrabajoMaestro:null,
        anio: null
    };
    ResultadoFinalEnum = ResultadoFinalEnum;
    validacionPlaza:string;
    private passport: SecurityModel = new SecurityModel();
    bandejaPlazaPUN:bandejaPlazaPUNModel = new bandejaPlazaPUNModel();
    constructor(
        private sharedService: SharedService,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        if (this.route.routeConfig.path.search('ver-contratacion-resultados-pun/') > -1) {
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
        // this.handleBuscar();
        this.codigoSede = this.passport.codigoSede;
        this.obtenerEstadoDesarrolloEtapa();
	this.obtenerFlujoEstado();
	this.buildSeguridadControles();
    }
    
    buildSeguridadControles = () => {
        const data = { 
            idEtapaProceso:this.idEtapaProceso, 
            codTipoSede:this.passport.codigoTipoSede,
            codRol:this.passport.codigoRol
        }
        this.dataService
	    .Contrataciones()
	    .getObtenerAccesoUsuariosValidacionPlazas(data)
	    .pipe(catchError(
		(e) => of([e])),
                finalize(() => {})
             ).subscribe(this.bandejaPlazaPUN.setSeguridad);       
    }


    ngAfterViewInit() {
        this.paginatorPlazasIncorporadas.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();
        this.paginatorPlazasPublicadas.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();
        this.paginatorResultadoFinal.page.pipe(tap(() => this.handleBuscarPaginator())).subscribe();
        setTimeout((_) =>{ 
        this.dataService
            .Contrataciones()
            .obtenerCabeceraEtapaProcesoById(this.idEtapaProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            ).subscribe((response: any) => {
                if (response) {
                  this.anio = response.anio;
                  this.handleBuscar();
                }
            });
        });
    }

    estadoDesarrollo:any;
    comiteAprobado:boolean;
    totalIncorporados: number=0;

    obtenerEstadoDesarrolloEtapa = () => {
        let idProcesoEtapa = this.route.snapshot.params.id;
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
                    this.comiteAprobado = response.comiteAprobado;
                    this.totalIncorporados = response.totalIncorporados;
                    console.log("estado servicio comite aprobado", this.comiteAprobado)
                    console.log("total Incorporados : ", response);

                    this.verificarIniciarEstadoPorIncorporacion();
                }
            console.log("Estado de desarrollo : ", this.estadoDesarrollo);

            });
    };

    verificarIniciarEstadoPorIncorporacion(){
        if (this.estadoDesarrollo == 'PENDIENTE' && this.totalIncorporados>0){
            // inicializar etapa por incorporacion
             // ****************** codigo para  iniciar estado segun requerimiento de pruebas unitariasconvocar plazas ****************
             if (this.estadoDesarrollo == 'PENDIENTE') { // EstadoEtapaProcesoEnum.PENDIENTE

                this.passport = this.dataService.Storage().getInformacionUsuario();
                this.dataService.Contrataciones().VerificarEtapaProcesoAnteriorFinalizado({"idEtapaProceso":this.idEtapaProceso, "codigoCentroTrabajoMaestro":this.passport.codigoSede})
                .subscribe((response:any) =>{
                    if(response){
                        // ****************************************************************
                        let data = {
                            idEtapaProceso: this.idEtapaProceso,
                            usuarioModificacion: this.passport.numeroDocumento,
                            idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                            codigoCentroTrabajoMaestro: this.passport.codigoSede
                        };
                        this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                            catchError((e) => of([e])),
                            finalize(() => {
                            })
                        )
                        .subscribe((d: any) => {
                            this.estadoDesarrollo = 'INICIADO';
                        });
                    }
                    else{
                        this.dataService.Message().msgWarning('"LA ETAPA ANTERIOR TODAVÍA NO HA SIDO FINALIZADA."', () => {});
                    }
                });
                this.obtenerEstadoDesarrolloEtapa(); // loop infinito?
            } 
            // ****************** fin de codigo
        }
    }

    iniCombos(): void{
        this.loadEstados();          
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idEstado: [ComboDefault.ValueTodos],
            codigoCentroTrabajo: [null],
            codigoPlaza: [null]
        });
    }

    buildGrids(): void {
        this.dataSourceIncorporadas = new PlazasContratacionPUNDataSource(this.dataService);
        this.dataSourcePublicadas = new PlazasContratacionPUNDataSource(this.dataService);
        this.dataSourceResultadoFinal = new PlazasContratacionPUNDataSource(this.dataService);
        this.buildPaginators(this.paginatorPlazasIncorporadas);
        this.buildPaginators(this.paginatorPlazasPublicadas);
        this.buildPaginators(this.paginatorResultadoFinal);
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
	this.firstTime=true;
	this.handleBuscar();
    }

    resetForm = () => {
        this.form.reset();
    };


    handleSelectTab = (e) => {
        this.firstTime = true;
        // console.log("Tab Changed: ", e.index);
        this.selectedTabIndex = e.index;
        this.resetForm();
        this.handleBuscar();
        this.firstTime = false;
        if(e.index == 2) {
          this.form.get('idEstado').setValue(-1);
        }
    };
    handleBuscarPaginator = () => this.ObtenerDataParaGrilla();
    handleBuscar = () => {
	this.paginatorResultadoFinal.firstPage();
	this.paginatorPlazasPublicadas.firstPage();
	this.paginatorPlazasIncorporadas.firstPage();
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
            this.buscarPlazasContratacionIncorporadas();
            this.buscarPlazasContratacionPublicadas();
            this.buscarPlazasContratacionResultadoFinal();  
        }
        else{
            if (this.selectTab == this.selectTabId.IncorporacionPlaza) {
                this.buscarPlazasContratacionIncorporadas();
            }
            if (this.selectTab == this.selectTabId.PlazasPublicadas) {
                this.buscarPlazasContratacionPublicadas();
            }
            if (this.selectTab == this.selectTabId.ResultadoFinal) {
                this.buscarPlazasContratacionResultadoFinal();
            }
        }
        this.firstTime = false;

    }
    loadEstados = () => {
        this.dataService.Contrataciones().getCombosEstadosPUN(CatalogoItemEnum.ESTADO_RESULTADO_FINAL).pipe(
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

    private buscarPlazasContratacionIncorporadas = () => {
        this.request.idSituacionValidacion = SituacionPlazasEnum.INCORPORACION;
        this.dataSourceIncorporadas.load(this.request, this.paginatorPlazasPublicadas.pageIndex + 1, this.paginatorPlazasPublicadas.pageSize, this.firstTime);
    };

    private buscarPlazasContratacionPublicadas = () => {
        this.request.idSituacionValidacion = SituacionPlazasEnum.PUBLICADO;
        this.dataSourcePublicadas.load(this.request, this.paginatorPlazasPublicadas.pageIndex + 1, this.paginatorPlazasPublicadas.pageSize, this.firstTime);
    };

    private buscarPlazasContratacionResultadoFinal = () => {
        this.request.idSituacionValidacion = SituacionPlazasEnum.PUBLICADO;
        this.dataSourceResultadoFinal.load(this.request, this.paginatorResultadoFinal.pageIndex + 1, this.paginatorResultadoFinal.pageSize, this.firstTime);
    };

    setRequest() {
        const formulario = this.form.getRawValue();

        let idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.id_plaza : null;
        let codigoPlaza = formulario.codigoPlaza ? formulario.codigoPlaza : null;
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo ? formulario.codigoCentroTrabajo : null;
        let idEstado = this.form.value.idEstado == ComboDefault.ValueTodos ? null : this.form.value.idEstado;

        let codigoCentroTrabajoMaestro = this.passport.codigoSede;

        this.request = {
            idPlaza: idPlaza,
            idEtapaProceso: this.idEtapaProceso,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo,
            idSituacionValidacion: null,
            plazasPublicar: null,
            idResultadoFinal: idEstado,
            codigoCentroTrabajoMaestro : codigoCentroTrabajoMaestro,
            anio:this.anio
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
                idEtapaProceso: this.idEtapaProceso,
		idRegimenLaboral: RegimenLaboralEnum.LEY_30328,
		codigoCentroTrabajo: this.passport.codigoSede
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                console.log("resultado modal codigo plaza", result);
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }

    handleAperturarPlaza = () => {
        let d = {
            idEtapaProceso: this.idEtapaProceso,
            usuarioModificacion: this.passport.numeroDocumento,
	    idFlujoEstado:this.bandejaPlazaPUN.getIdFlujoEstado()
        }
        this.dataService.Message().msgConfirm('¿Está seguro de aperturar plaza?', () => {
            this.dataService.Spinner().show("sp6");
            this.setRequest();
            this.dataService.Contrataciones().putAperturarPlazaPUN(d).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response > -1) {
                        // this.dataService.Message().msgAutoCloseSuccessNoButton(MensajesSolicitud.M07,3000, () => {});
                        this.obtenerPlazaContratacion();
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
                            // this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
                    }
                });
        }, () => {});

    }

    handleExportarPlazasPublicadas = () => {
        this.handleExportarPlazasContratacionResultadoPUN(this.dataSourcePublicadas.data, SituacionPlazasEnum.PUBLICADO, ActivoFlagEnum.ACTIVO,  "Contratacion_Resultados_PUN_Publicadas.xlsx");
    }

    handleExportarPlazasResultadoFinal = () => {
        this.handleExportarPlazasContratacionResultadoPUN(this.dataSourceResultadoFinal.data, SituacionPlazasEnum.PUBLICADO, ActivoFlagEnum.INACTIVO, "Contratacion_Resultados_PUN_Resultado_Final.xlsx");
    }

    handleExportarPlazasIncorporadas = () => {
        this.handleExportarPlazasContratacionResultadoPUN(this.dataSourceIncorporadas.data, SituacionPlazasEnum.INCORPORACION, ActivoFlagEnum.INACTIVO, "Contratacion_Resultados_PUN_Incorporadas.xlsx");
    }

    handleExportarPlazasContratacionResultadoPUN = (dataSource: any[], codigoValidacion: number, flagPlaza: number, nombreExcel: string) => {
        if (dataSource.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',
                () => {}
            );
            return;
        }        

        let requestExport: any = {
            idEtapaProceso: this.idEtapaProceso, 
            idSituacionValidacion: codigoValidacion,
            codigoCentroTrabajoMaestro:this.codigoSede,
	    tab:this.selectTab,
	    nombreExcel:nombreExcel,
            anio:this.anio
        };

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelContratacionResultadosPUN(requestExport).pipe(catchError((e) => of(null)),
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

    handleIncorporarPlazas() {
        this.passport = this.dataService.Storage().getInformacionUsuario();
        
        const data = {
            idEtapaProceso : this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.passport.codigoSede,
            fragmentoUrlRetornar:'contratacion-resultados-pun',
            fragmentoUrlRetornarComplemento:'bandeja-plazas',
	    idRegimen: RegimenLaboralEnum.LEY_30328,
        };
        console.log("Datos, enviados a bandeja Incorporar Plazas",data);
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
                idRegimen: data.idRegimen,
                fragmentoUrlRetornar:data.fragmentoUrlRetornar,
                fragmentoUrlRetornarComplemento:data.fragmentoUrlRetornarComplemento,
                esBecario:false,
		commandoMetaData:this.bandejaPlazaPUN.getComandoMetaData(),
		idFlujoEstado:this.bandejaPlazaPUN.getIdFlujoEstado(),
                idEstadoDesarrollo: this.idEstadoDesarrollo
            },
        ]);
        // this.handleBuscar();
    }
    
    informacionPlazaView = (id) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPlazaPUNComponent,
            {
                panelClass: "modal-informacion-plaza-pun-dialog",
                width: "1000px",
                disableClose: true,
                data: {
                    idPlaza: id,
                    idEtapaProceso: this.idEtapaProceso,
                    anio:this.anio
                },
            }
        );
    }

    eliminarPlazaIncorporada = (data, index) => {
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA QUITAR LA PLAZA INCORPORADA?',
            () => {
                let eliminarIncoporacion: any =
                {
                    idPlazaContratacionDetalleIncorporada: data.idPlazaContratacionDetalle,
                    codigoCentroTrabajoMaestro: this.passport.codigoSede,
                    codigoRolPassport: this.passport.codigoRol,
                    idEtapaProceso: this.idEtapaProceso,
                    ipCreacion: '',
                    usuarioModificacion: this.passport.numeroDocumento,
                };
                this.dataService.Contrataciones().eliminarPlazaIncorporada(eliminarIncoporacion).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.handleBuscar();
                        this.dataService
                            .Message()
                            .msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {});
                    } else {
                        this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE ELIMINAR PLAZA."',() => {});
                    }                    
                });

                //const request = {
                    //idEtapaProceso: this.idEtapaProceso,
                    //idPlaza: data.idPlaza,
                    //usuarioModificacion: this.passport.numeroDocumento
                //};
//
                //this.dataService.Spinner().show("sp6");
                //this.dataService.Contrataciones().eliminarPlazasContratacionDirecta(request).pipe(catchError(() => of([])),
                    //finalize(() => {
                        //this.dataService.Spinner().hide("sp6");
                    //})
                //)
                //.subscribe((result: number) => {
                    //if (result) {
                        //this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {                           
                        //});
                        //this.handleBuscar();
                    //} else {
                        //this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE ELIMINAR LA PLAZA INCORPORADA."')
                    //}                     
                //});
            }
        );
    }

    handlePublicarPlazasIncorporadas = () => {
        if (this.dataSourceIncorporadas.data.length == 0) {
            this.dataService.Message().msgWarning('No ha incorporado plazas para su publicación.', () => { });
            return;
        }

        this.dataService.Message().msgConfirm(
                '¿ESTA SEGURO QUE DESEA PUBLICAR LAS PLAZAS INCORPORADAS?',
                () => {
                    this.dataService.Spinner().show("sp6");
                    
                    const request: any = {
                        idEtapaProceso: this.idEtapaProceso,
                        usuarioModificacion: this.passport.numeroDocumento,
                        plazasPublicar: this.dataSourceIncorporadas.data.map((c: any) => {
                            return {
                                idPlazaContratacion: c.idPlazaContratacion,
                                idPlazaContratacionDetalle: c.idPlazaContratacionDetalle,
                            };
                        }),
                        codigoCentroTrabajoMaestro:this.passport.codigoSede,
                        idSituacionValidacion : SituacionPlazasEnum.INCORPORACION,
			idFlujoEstado: this.bandejaPlazaPUN.getIdFlujoEstado(),
                        idIteracion: this.bandejaPlazaPUN.getIteracion()
                    };

                    this.dataService.Contrataciones().publicarPlazasContratacionResultadosPUN(request).pipe(
                        catchError((e) => of([e])),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response: any) => {
                        if (response > 0) {
                            this.dataService.Message().msgSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA", () => {});
                            this.handleBuscar();
                            this.obtenerPlazaContratacion();
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
                                // this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                            }
                        }
                    });
                }
            );
    };

    handleVerListadoPlazas() {
        this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent, {
            panelClass: 'minedu-modal-documentos-publicados',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idGrupoDocumento: GrupoDocumentoPublicadoEnum.CONTRATACION_PUN_PLAZAS,
                nombreDocumento: 'Plazas_Publicadas',
                dialogTitle:"Publicación de plazas de contratación docente",
                columnTitle:"Publicación",
                codigoCentroTrabajoMaestro: this.passport.codigoSede,
                idIteracion:this.bandejaPlazaPUN.getIteracion()
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            }
        );

        //this.dataService.Spinner().show("sp6");
        //this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent,
            //{
                //panelClass: "minedu-modal-documentos-publicados",
                //width: "400px",
                //disableClose: true,
                //data: {
                    //idEtapaProceso: this.idEtapaProceso,
                    //idGrupoDocumento: GrupoDocumentoPublicadoEnum.PLAZAS
                //},
            //}
        //);
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
            codigoCentroTrabajoMaestro:this.passport.codigoSede,
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
                    console.log(response);
                    if (response.length == 0) {
                        this.btnPublicar = true;
                    }
                    else {
                        this.plazaContratacion = response;
                        if (this.plazaContratacion[0].codigoEstadoValidacionPlaza == EstadoValidacionPlazaEnum.PENDIENTE ||
                        this.plazaContratacion[0].codigoEstadoValidacionPlaza == EstadoValidacionPlazaEnum.APERTURADO) {
                            this.btnPublicar = true;
                            this.validacionPlaza = 'APERTURADO';
                            }
                        else {
                            this.btnPublicar = false;
                        }
                        if (this.plazaContratacion[0].codigoEstadoValidacionPlaza == EstadoValidacionPlazaEnum.PUBLICADO) {
                            this.btnAperturar = true;
                            this.validacionPlaza = 'PUBLICADO';
                        } else {
                            this.btnAperturar = false;
                            this.validacionPlaza = 'PUBLICADO'; // 'PENDIENTE'
                        }
                        // console.log("Btsns: ", this.btnAperturar, this.btnPublicar);
                    }
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
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Resultados de PUN");
        this.sharedService.setSharedTitle("Plazas");
    }

    handleMigrarPlazasDesiertas() {
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA MIGRAR PLAZAS DESIERTAS?', () => {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
                codigoCentroTrabajoMaestro: this.passport.codigoSede,                
                usuarioCreacion:this.passport.numeroDocumento,
		idFlujoEstado:this.bandejaPlazaPUN.getIdFlujoEstado()
            };
            console.log("Datos a enviar request", request);
            // this.loading = true;
            this.dataService.Spinner().show("sp6");
	    this.dataService
	    .Contrataciones()
	    .migratePlazaContratacionesEtapaContratacionDirecta(request)
	    .pipe(
		catchError((error) => {
		    this.dataService.Message().msgWarning(error.error.messages[0]);
		    return of(null);
		}), 
		finalize(() => {
		    this.dataService.Spinner().hide("sp6");
		})
	    ).subscribe((result: any) => {
		if (result !== null) {
		    if (result > 0) {
			this.dataService.Message().msgAutoInfo('"'+ "OPERACIÓN REALIZADA DE FORMA EXITOSA"+'"',3000, () => { });
			// this.onChangeMigrarPlazaContratacion.emit(true);
			this.inicializarPorMigracionPlazas();
			this.handleBuscar();
			this.obtenerFlujoEstado();
		    } else {
			this.dataService.Message().msgInfo('"'+"NO EXISTE PLAZAS DESIERTAS EN LA ETAPA CONTRATACIÓN DIRECTA"+'"', () => { });
		    }
		}
	    });
        }, () => { });
    }
    inicializarPorMigracionPlazas(){
        let data = {
            idEtapaProceso: this.idEtapaProceso,
            usuarioModificacion: this.passport.numeroDocumento,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
            codigoCentroTrabajoMaestro: this.passport.codigoSede
        };
        this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
            catchError((e) => of([e])),
            finalize(() => {
            })
        )
        .subscribe((d: any) => {
            this.estadoDesarrollo = 'INICIADO';
        });
    }

    obtenerFlujoEstado (){
        let data = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.passport.codigoSede,
            codigoTipoAccion: TipoAccionEnum.PLAZA,
            codigoEstadoInformacion: FlujoEstadoEnum.PENDIENTE,
        }
        this.dataService.Contrataciones()
	    .getFlujoEstado(data)
	    .pipe(
		 catchError(() => { return of(null); })
	     )
	    .subscribe(this.bandejaPlazaPUN.setFlujoEstado);
    }

    handleInformacionDesarrolloProceso = ({idEstadoDesarrollo}) =>{
      this.idEstadoDesarrollo = idEstadoDesarrollo;
    }
}

export class PlazasContratacionPUNDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime=false): void {
        console.log("datasouce: ", firstTime);
        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            data.esResultadoFinal = true;
            this.dataService.Contrataciones().getBuscarPlazasPUNPaginado(data, pageIndex, pageSize).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if (response) {
                    this._dataChange.next(response || []);
                    this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_registros;
                    console.log("respuesta de suscribe en caso response positivo",response);

                    if ((response || []).length === 0 && !firstTime) {
                      this.dataService
                      .Message()
                      .msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
                    }
                } else {
                    let r = response[0];
                    console.log("respuesta de suscribe en caso response negativo",r);
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

