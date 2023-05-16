import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { SharedService } from "../../../../../../core/shared/shared.service";
import { Subscription, BehaviorSubject, of, Observable, Subject } from "rxjs";
import { BusquedaPlazaComponent } from "../../components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { catchError, finalize, tap } from "rxjs/operators";
import { ActivoFlagEnum, CatalogoItemEnum, CodigoMaestroActividad, EstadoEtapaProcesoEnum, GrupoDocumentoPublicadoEnum, MensajesSolicitud, SituacionPlazasEnum, TipoFormatoPlazaEnum } from "../../_utils/constants";
import { descargarExcel } from "app/core/utility/functions";
import { ModalIncorporacionPlazasComponent } from "./modal-incorporacion-plazas/modal-incorporacion-plazas.component";
import { ModalInformacionPlazaComponent } from "./modal-informacion-plaza/modal-informacion-plaza.component";
import { ModalDocumentosPublicadosComponent } from "../../components/modal-documentos-publicados/modal-documentos-publicados.component";
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from "app/core/model/messages-error";
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from '../../../../../../core/model/message';
import { criterioBusqueda } from '../../models/criterioBusqueda.model';
import { RegimenLaboralEnum } from '../../../reasignacion/_utils/constants';

@Component({
    selector: 'minedu-bandeja-incorporacion-plazas',
    templateUrl: './bandeja-incorporacion-plazas.component.html',
    styleUrls: ['./bandeja-incorporacion-plazas.component.scss'],
    animations: mineduAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class BandejaIncorporacionPlazasComponent implements OnInit {
    soloLectura = true;
    form: FormGroup;
    idEtapaProceso: number;
    firstTime = true;
    firstTimeLoadData:boolean = true;
    currentTabIndex:number;

    nroEtapasIniciadas = 0;
    fechaFinRegional = new Date();

    codigoSede:any;
    dialogRef: any;
    selectTab = 1;
    becario: string;
    isMobile = false;
    selectedTabIndex = 1;
    estados: any[] = [];
    fecha = new Date();
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
    centroTrabajoFiltroSeleccionado: any;
    dataSourceIncorporadas: PlazasContratacionIncorporadasDataSource | null;
    dataSourcePublicadas: PlazasContratacionPublicadasDataSource | null;
    dataSourceResultadoFinal: PlazasContratacionResultadoFinalDataSource | null;
    displayedColumnsPlazasIncorporadas: string[] = [
        "registro",
        "codigo_modular",
        "centro_trabajo",
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
        idResultadoFinal: null,
        idRegimenLaboral: null,
        codigoCentroTrabajoMaestro: null
    };

    private passport: SecurityModel = new SecurityModel();
    validacionPlaza:string;
    currentSession:any;
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
        if (this.route.routeConfig.path.search('ver-contratacion-directa/') > -1) {
            this.soloLectura = true;
        } else {
            this.soloLectura = false;
        }
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.buildForm();
        this.buildGrids();
        this.handleResponsive();
        this.getEstadosResultadoFinal();

        this.buildSeguridadControles();
        this.codigoSede = this.passport.codigoSede;
        this.obtenerPlazaContratacion();
        this.obtenerFechaDeCortePublicacion();
        this.obtenerEstadoDesarrolloEtapa();
        //this.selectedTabIndex =  1;
    }

    obtenerFechaDeCortePublicacion = () => {
        let idProcesoEtapa = +this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;
        let codigoMaestroActividad = CodigoMaestroActividad.PUBLICACION_CONTRATACION_DIRECTA; // TODO: CREAR ENUM PARA ACTIVIDAD VALIDACIOND E PLAZAS

        this.dataService
            .Contrataciones()
            .obtenerFechaDeCortePublicacion(idProcesoEtapa, codSede, codigoMaestroActividad) // verificar
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log("obtener fecha corte:",response);
                    // this.fechaCorte = response.fechaDeCorte;
                    this.fechaFinRegional = response.fechaFinRegional;
                    this.nroEtapasIniciadas = +response.nroEtapasIniciadas;
                    // if(this.fechaCorte)
                    //    this.fechaCorteVisible = this.fechaCorte;
                }
            });
    };

    estadoDesarrollo:any;
    adjudicacionFinalizada:any;
    totalPostulantes:number = 0;
    totalAdjudicados:number = 0;
    totalNoAdjudicados:number = 0;
    totalObservados:number = 0; 
    totalIncorporados: number=0;
    comiteAprobado:boolean;
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
        if (this.validacionPlaza == 'PENDIENTE' && this.totalIncorporados>0){
            // inicializar etapa por incorporacion
            
             // ****************** codigo para  iniciar estado segun requerimiento de pruebas unitariasconvocar plazas ****************
             if (this.validacionPlaza == 'PENDIENTE') { // EstadoEtapaProcesoEnum.PENDIENTE

                this.currentSession = this.dataService.Storage().getInformacionUsuario();
                this.dataService.Contrataciones().VerificarEtapaProcesoAnteriorFinalizado({"idEtapaProceso":this.idEtapaProceso, "codigoCentroTrabajoMaestro":this.currentSession.codigoSede})
                .subscribe((response:any) =>{
                    if(response){
                        // ****************************************************************
                        let data = {
                            idEtapaProceso: this.idEtapaProceso,
                            usuarioModificacion: this.currentSession.numeroDocumento,
                            idEstadoDesarrollo: EstadoEtapaProcesoEnum.INICIADO,
                            codigoCentroTrabajoMaestro: this.currentSession.codigoSede
                        };
                        this.dataService.Contrataciones().putActualizarEtapaProceso(data).pipe(
                            catchError((e) => of([e])),
                            finalize(() => {
                            })
                        )
                        .subscribe((d: any) => {
                            this.validacionPlaza = 'INICIADO';
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

    ngAfterViewInit() {
        this.paginatorPlazasIncorporadas.page.pipe(tap(() => this.buscarPlazasContratacion())).subscribe();
        this.paginatorPlazasPublicadas.page.pipe(tap(() => this.buscarPlazasContratacion())).subscribe();
        this.paginatorResultadoFinal.page.pipe(tap(() => this.buscarPlazasContratacion())).subscribe();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            codigoCentroTrabajo: [null],
            codigoPlaza: [null],
            estado: [null]
        });

        setTimeout((_) => this.handleBuscar());
    }

    buildGrids(): void {
        this.dataSourceIncorporadas = new PlazasContratacionIncorporadasDataSource(this.dataService);
        this.dataSourcePublicadas = new PlazasContratacionPublicadasDataSource(this.dataService);
        this.dataSourceResultadoFinal = new PlazasContratacionResultadoFinalDataSource(this.dataService);
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

    controlesActivos:ControlesActivos = {
        btnFinalizarValidacionPlazas:false, btnPublicarPlazas:false, btnAperturarPublicacion:false, btnIncorporarPlazas: false, btnPlazasConvocar:false, btnPlazasObservadas:false, btnVerPlazasPDF:false, btnExportar:false, btnEliminarPlazas:false   
    }
    
    buildSeguridadControles = () => {
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
                 console.log ("controlesActivos",this.controlesActivos);
            }
        });       

    }

    getEstadosResultadoFinal() {
        this.dataService.Contrataciones().getComboEstadosResultadoFinal(CatalogoItemEnum.ESTADO_RESULTADO_FINAL).pipe(
            catchError(() => {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.ESTADOS_RESULTADO_FINAL, SNACKBAR_BUTTON.CLOSE);
                return of(null);
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.estados = response;
            } else {
                this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.ESTADOS_RESULTADO_FINAL, SNACKBAR_BUTTON.CLOSE);
                this.estados = [];
            }
        });
    }

    handleSelectTab = (e) => {
        this.selectedTabIndex = e.index;
        this.resetForm();
        this.handleBuscarTabs();
    };

    handleLimpiar(): void {
        this.resetForm();
	this.handleBuscar();
    }

    resetForm = () => {
        this.form.reset();
        this.firstTime = true;
	this.plazaFiltroSeleccionado=this.centroTrabajoFiltroSeleccionado=null;
    };

    handleBuscar = () => {
        this.paginatorPlazasIncorporadas.firstPage();
        this.paginatorPlazasPublicadas.firstPage();
        this.paginatorResultadoFinal.firstPage();
        this.buscarPlazasContratacion();
    }
    handleBuscarTabs(){
        this.firstTime = true;
        this.handleBuscar();
    }

    buscarPlazasContratacion = () => {
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
        /*
        if(this.firstTime) 
        {
        this.buscarPlazasContratacionIncorporadas();
        this.buscarPlazasContratacionPublicadas();
        this.buscarPlazasContratacionResultadoFinal();
        }
        else{
            switch (this.selectedTabIndex){
               case 0 :  this.buscarPlazasContratacionIncorporadas(); break;
               case 1 :  this.buscarPlazasContratacionPublicadas(); break;
               case 2 :  this.buscarPlazasContratacionResultadoFinal(); break;
               default : this.buscarPlazasContratacionPublicadas(); break;
            }
        } */

       

        switch (this.selectedTabIndex){
            case 0 :  this.buscarPlazasContratacionIncorporadas(); break;
            case 1 :  this.buscarPlazasContratacionPublicadas(); break;
            case 2 :  this.buscarPlazasContratacionResultadoFinal(); break;
            default : this.buscarPlazasContratacionPublicadas(); break;
         }

        this.firstTime = false;

    };

    private buscarPlazasContratacionIncorporadas = () => {
        this.dataSourceIncorporadas.load(this.request, this.paginatorPlazasIncorporadas.pageIndex + 1, this.paginatorPlazasIncorporadas.pageSize,  this.firstTime);
    };

    private buscarPlazasContratacionPublicadas = () => {
        this.dataSourcePublicadas.load(this.request, this.paginatorPlazasPublicadas.pageIndex + 1, this.paginatorPlazasPublicadas.pageSize,  this.firstTime);
    };

    private buscarPlazasContratacionResultadoFinal = () => {
        this.dataSourceResultadoFinal.load(this.request, this.paginatorResultadoFinal.pageIndex + 1, this.paginatorResultadoFinal.pageSize,  this.firstTime);
    };

    setRequest() {
        const formulario = this.form.getRawValue();

        let idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.idPlaza : null;
        let codigoPlaza = formulario.codigoPlaza;
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo;
        let resultadoFinal = formulario.estado;

        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idPlaza: idPlaza,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo,
            idResultadoFinal: resultadoFinal,
            idRegimenLaboral: null,
            codigoCentroTrabajoMaestro:this.passport.codigoSede
        };
    }

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
            panelClass: "buscar-centro-trabajo-dialog",
            width: "1300px",
            disableClose: true,
            data: {
                action: "requerimiento",
                codigoSede : this.passport.codigoSede,
		idEtapaProceso: this.idEtapaProceso
            },
        });

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
                idEtapaProceso : this.idEtapaProceso,
		codigoCentroTrabajo: this.currentSession.codigoSede
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
            }
        });
    }

    handleExportarPlazasPublicadas = () => {
        this.handleExportarPlazasContratacionDirecta(this.dataSourcePublicadas.data, SituacionPlazasEnum.PUBLICADO, ActivoFlagEnum.ACTIVO,  "Contratacion_Directa_Plazas_Publicadas");
    }

    handleExportarPlazasResultadoFinal = () => {
        this.handleExportarPlazasContratacionDirecta(this.dataSourceResultadoFinal.data, SituacionPlazasEnum.PUBLICADO, ActivoFlagEnum.INACTIVO, "Contratacion_Directa_Plazas_Resultado_Final");
    }

    handleExportarPlazasIncorporadas = () => {
        this.handleExportarPlazasContratacionDirecta(this.dataSourceIncorporadas.data, SituacionPlazasEnum.INCORPORACION, ActivoFlagEnum.INACTIVO, "Contratacion_Directa_Plazas_Incorporadas");
    }

    handleExportarPlazasContratacionDirecta = (dataSource: any[], codigoValidacion: number, flagPlaza: number, nombreExcel: string) => {
        if (dataSource.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }       

        let requestExport: any = {
            idEtapaProceso: this.idEtapaProceso,
            idSituacionValidacion: codigoValidacion,
            flag: flagPlaza,
            codigoCentroTrabajoMaestro:this.codigoSede
        };

        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        try{
            var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = nombreExcel+"" + ".xlsx";
        }
        // ************************************************************************************************


        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelContratacionDirectaPlazas(requestExport).pipe(catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, nombreExportar);
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
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
            fragmentoUrlRetornar:"contratacion-directa",//"contratacion-directa"+"/"+"bandeja-plazas"
            fragmentoUrlRetornarComplemento:"bandeja-plazas",
	        idRegimen: RegimenLaboralEnum.LEY_30328
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
		esBecario:true, 
        textosConcatenadosConGuion:encodeURIComponent('Plazas-Plazas')
	    }
        ]);
      
        // this.dialogRef = this.materialDialog.open(ModalIncorporacionPlazasComponent, {
        //     panelClass: "modal-incorporacion-plaza-dialog",
        //     width: "100%",
        //     disableClose: true,
        //     data: {
        //         idEtapaProceso: this.idEtapaProceso,
        //         codigoCentroTrabajoMaestro:this.passport.codigoSede
        //     },
        // });

        // this.dialogRef.afterClosed().subscribe((response: any) => {
        //     if (response) {
        //         this.handleBuscar();
        //     } else {
        //         return;
        //     }
        // });
    }

    informacionPlazaView = (id) => {
        this.dialogRef = this.materialDialog.open(ModalInformacionPlazaComponent, {
            panelClass: "modal-informacion-plaza-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idPlaza: id
            },
        });
    }

    eliminarPlazaIncorporada = (data) => {
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA QUITAR LA PLAZA INCORPORADA?',
            () => {
                const request = {
                    idEtapaProceso: this.idEtapaProceso,
                    idPlaza: data.idPlaza,
                    usuarioModificacion: this.passport.numeroDocumento
                };

                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().eliminarPlazasContratacionDirecta(request).pipe(catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {});
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE ELIMINAR LA PLAZA INCORPORADA."')
                    }                     
                });
            }
        );
    }

    handlePublicarPlazasIncorporadas = () => {
        if (this.dataSourceIncorporadas.data.length == 0) {
            this.dataService.Message().msgWarning('"NO HA INCORPORADO PLAZAS PARA SU PUBLICACIÓN."', () => { });
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE DESEA PUBLICAR LAS PLAZAS INCORPORADAS?',
            () => {
                const request = {
                    idEtapaProceso: this.idEtapaProceso,
                    maestroProceso: 'CONTRATACIÓN DIRECTA',
                    anio: this.fecha.getFullYear(),
                    subInstancia: this.passport.nombreSede.toUpperCase(), //'UGEL BARRANCA',
                    idGrupoDocumento: GrupoDocumentoPublicadoEnum.INCORPORACION,
                    usuarioModificacion: this.passport.numeroDocumento,
                    codigoCentroTrabajoMaestro: this.codigoSede,
                };
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().publicarPlazasContratacionDirecta(request).pipe(catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result > 0) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {});
                        this.selectTab = 1;
                        this.firstTime=true;
                        this.handleBuscar();
                        this.firstTime = true;
                        this.buscarPlazasContratacion();           
                        this.obtenerPlazaContratacion();
                    } else {
                        this.dataService.Message().msgWarning('"OCURRIÓ UN PROBLEMA AL TRATAR DE PUBLICAR PLAZAS."')
                    }                     
                });
            }
        );
    };

    obtenerPlazaContratacion(): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        let d = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
        }
        
        this.dataService.Contrataciones().getObtenerPlazaContratacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                if (response.length > 0) {
                    if (response[0].estadoValidacionPlaza == 'PRE PUBLICADO') {
                        this.validacionPlaza = 'PENDIENTE';
                    } else {
                        this.validacionPlaza = response[0].estadoValidacionPlaza;
                        if (this.validacionPlaza == 'APERTURADO' || this.validacionPlaza == 'PENDIENTE')
                        {
                          if(!this.firstTimeLoadData)
                            this.selectedTabIndex =  0;
                          this.handleBuscarTabs();
                          this.firstTimeLoadData = false;
                        }
                    }
                }
                else {
                    this.validacionPlaza = 'PENDIENTE';
                }
            }
            console.log("Estado ValidacionPlaza actual: ", this.validacionPlaza)
        });
    }

    handleGenerarVerPlazasPublicadas() {
        this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent, {
            panelClass: 'minedu-modal-documentos-publicados',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idGrupoDocumento: GrupoDocumentoPublicadoEnum.INCORPORACION
            }
        });
    
        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
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
        this.sharedService.setSharedBreadcrumb("Contratación / Contratación Directa");
        this.sharedService.setSharedTitle("Plazas");
    }

    handleAperturarValidacionPlazas  = () => {
        console.log("Estado ValidacionPlaza inicial: ", this.validacionPlaza)
        // ********************************
        let fechaActual = new Date();
        console.log("Booleano aperturar plazas fecha:",this.nroEtapasIniciadas, " - ",this.fechaFinRegional," - ", fechaActual > this.fechaFinRegional);
        if(fechaActual > this.fechaFinRegional){
            return this.dataService.Message().msgAutoCloseWarningNoButton('"NO SE PUEDE APERTURAR LA VALIDACIÓN DE PLAZAS, YA QUE FINALLIZÓ LA ACTIVIDAD VALIDACIÓN, SEGÚN CRONOGRAMA REGIONAL."',3000, () => {}); // M152
        }
        console.log("Booleano nro etapas inciadasl:", this.nroEtapasIniciadas);
        if(this.nroEtapasIniciadas>0){
            return this.dataService.Message().msgAutoCloseWarningNoButton('"NO SE PUEDE APERTURAR LA VALIDACIÓN DE PLAZAS, YA QUE EXISTEN ETAPAS INICIADAS EN EL PROCESO"',3000, () => {}); // M156
        }
        // *********************************

        const request: any = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: 'ADMIN',
            ipModificacion : '::1',
            fechaModificacion : new Date(),
            codigoCentroTrabajoMaestro:this.currentSession.codigoSede,
        };

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA REALIZAR LA APERTURA DE LA PUBLICACIÓN DE PLAZAS?',
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().putAperturarPlazasValidacion(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response > 0) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {});
                        this.obtenerPlazaContratacion();
			this.selectTab = 1;
                        console.log("Estado ValidacionPlaza final: ", this.validacionPlaza)
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA ETAPA DE VALIDACION DE PLAZAS"', () => {});
                    }
                });
            }, (error) => {}
        );
    }

}

export class PlazasContratacionIncorporadasDataSource extends DataSource<any> {
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
            data.idSituacionValidacion = SituacionPlazasEnum.INCORPORACION;

            this.dataService.Contrataciones().getBuscarPlazasDirectaPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
                if ((plazasContratacion || []).length === 0 && !firstTime) {
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

export class PlazasContratacionPublicadasDataSource extends DataSource<any> {
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
            data.idSituacionValidacion = SituacionPlazasEnum.PUBLICADO;

            this.dataService.Contrataciones().getBuscarPlazasDirectaPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe(response => {
                if (response) {
                    this._dataChange.next(response || []);
                    this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_registros;
                    if (this.totalregistro == 0  && !firstTime) {
                      this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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
                        this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
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
            data.idSituacionValidacion = SituacionPlazasEnum.PUBLICADO;

            this.dataService.Contrataciones().getBuscarPlazasDirectaPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe(response => {
                if (response) {
                    this._dataChange.next(response || []);
                    this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_registros;
                    if (this.totalregistro == 0  && !firstTime) {
                        this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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
                        this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
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
