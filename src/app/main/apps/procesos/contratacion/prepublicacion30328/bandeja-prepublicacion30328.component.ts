import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { mineduAnimations } from "../../../../../../@minedu/animations/animations";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataSource } from "@angular/cdk/table";
import { MatPaginator } from "@angular/material/paginator";
import { CollectionViewer, SelectionModel } from "@angular/cdk/collections";
import { DataService } from "app/core/data/data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { BehaviorSubject, of, Observable } from "rxjs";
import { ResumenPlazasResponseModel,NivelInstanciaCodigoEnum,IActualizarPlazaContratacionSiEsBecarioViewModel, IActualizarEtapaProcesoViewModel  } from "../models/contratacion.model";
import { MatDialog } from "@angular/material/dialog";
import { BusquedaPlazaComponent } from "../components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { TablaPermisos } from "app/core/model/types";
import { SecurityModel } from "app/core/model/security/security.model";
import { CentroTrabajoModel } from "app/core/model/centro-trabajo.model";
import { SharedService } from "../../../../../core/shared/shared.service";
import { TipoFormatoPlazaEnum, EstadoEtapaProcesoEnum, GrupoDocumentoPublicadoEnum, RegimenLaboralEnum, CentroTrabajoEnum, TipoAccionEnum, FlujoEstadoEnum } from "../_utils/constants";
import { InformacionPlaza30328Component } from "./informacion-plaza/informacion-plaza30328.component";
import { ModalIncorporacionPlazasComponent } from "../contrataciondirecta/bandeja-incorporacion-plazas/modal-incorporacion-plazas/modal-incorporacion-plazas.component";
import { ModalDocumentosPublicadosComponent } from "../components/modal-documentos-publicados/modal-documentos-publicados.component";
import { ModalDocumentosPrepublicadosFechaComponent } from "../components/modal-documentos-prepublicados-fecha/modal-documentos-prepublicados-fecha.component";
import { criterioBusqueda } from '../models/criterioBusqueda.model';
import { bandejaPublicacion } from '../models/bandejaPublicacion';

@Component({
    selector: "minedu-bandeja-prepublicacion30328",
    templateUrl: "./bandeja-prepublicacion30328.component.html",
    styleUrls: ["./bandeja-prepublicacion30328.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPrepublicacion30328Component implements OnInit {
    soloLectura = true;
    dataSourceDocentes: PlazasContratacionDocentesDataSource | null;
    fecha = new Date();
    fechaCorteVisible = new Date();
    fechaCorte:Date;
    fechaFinNacional:Date;
    jobEjecutado = false;
    firstTime = true;
    nroEtapasIniciadas : number = 0;
    //paginatorDocentesPageSize = 10;
    paginatorDocentesPageIndex = 0;
    @ViewChild("paginatorDocentes", { static: true })
    paginatorDocentes: MatPaginator;
    selectionDocentes = new SelectionModel<any>(true, []);
    displayedColumnsDocentes: string[] = [
        "registro",
        "instancia",
        "subinstancia",
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

    dataSourceBecarios: PlazasContratacionBecariosDataSource | null;
    paginatorBecariosPageSize = 10;
    paginatorBecariosPageIndex = 0;
    @ViewChild("paginatorBecarios", { static: true })
    paginatorBecarios: MatPaginator;
    selectionBecarios = new SelectionModel<any>(true, []);
    displayedColumnsBecarios: string[] = [
        "registro",
        "instancia",
        "subinstancia",
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

    form: FormGroup;
    idEtapaProceso: number;
    idEstadoDesarrollo: number;
    codSedeCabecera:string = CentroTrabajoEnum.MINEDU; // added
    estadoDesarrollo:any;
    anio:any;
    validacionPlaza: string;
    dialogRef: any;
    selectedTabIndex = 0;
    resumenPlazas: ResumenPlazasResponseModel;
    idPlazaContratacion: number;

    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
        autorizadoConsultar:false,
    };
    currentSession: SecurityModel = new SecurityModel();

    controlesActivos:ControlesActivos = {
        btnFinalizarEtapa : true,
        btnAperturaEtapa : true,
        btnIncorporarPlazas: true,
        btnPrePublicarPlazas:true,
        btnPlazaBecarios:true,
        btnVerPlazasPDF:true,
        btnExportar:true,    
	btnPlazaContratacionDocente:true
    }

    

    centroTrabajo: CentroTrabajoModel = null;
    working = false;
    isMobile = false;

    request = {
        idInstancia: null,
        idNivelInstancia: null,
        idSubInstancia: null,
        idNivelSubInstancia: null,
        idPlaza: null,
        codigoPlaza: null,
        idCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idEtapaProceso: null,
        idRegimenLaboral: null,
        anio: null,
    };

    instancias: any[];
    subinstancias: any[];
    tiposCentroTrabajo: any[];
    plazaFiltroSeleccionado: any;
    centroTrabajoFiltroSeleccionado: any;

    modelBandejaPublicacion:bandejaPublicacion = new bandejaPublicacion();
    modelCriterioBusqueda:criterioBusqueda = new criterioBusqueda();
    buscarPaginator:boolean = false;
    ocultarLoader:boolean=false;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) {}
    ngOnInit(): void {
        if (this.route.routeConfig.path.search('ver-prepublicacion/') > -1) {
            this.soloLectura = true;
        } else {
            this.soloLectura = false;
        }
        setTimeout((_) => this.buildShared());
        this.idEtapaProceso = +this.route.snapshot.params.id;
        this.buildForm();
        this.buildGrids();
        this.buildSeguridad();
        this.handleResponsive();
        this.obtenerPlazaContratacion();
        this.loadInstancia(true);
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.codSedeCabecera = '000000'; //Cod Minedu Prepublicacion // this.currentSession.codigoSede;
        this.ocultarBreadCrumOriginal();
        this.obtenerEstadoDesarrolloEtapa();
        this.obtenerFechaDeCortePrepublicacion();
        this.obtenerEstadoJobEjecutado();
        this.obtenerFlujoEstado();

    }
    ngAfterViewInit() {
        this.paginatorDocentes.page.pipe(tap(() =>{
	    this.buscarPaginator = true;
	    this.handleBuscar();
					})).subscribe();
        this.paginatorBecarios.page.pipe(tap(() => {
	    this.buscarPaginator = true;
	    this.handleBuscar()
	})).subscribe();
	this.modelCriterioBusqueda.asignarActivoSubInstancia(true);
    }

    buildGrids(): void {
        this.dataSourceDocentes = new PlazasContratacionDocentesDataSource(this.dataService);

        if(this.dataSourceBecarios != null)
            this.dataSourceDocentes.totalregistroglobal += this.dataSourceBecarios.totalregistro;

        this.dataSourceBecarios = new PlazasContratacionBecariosDataSource(this.dataService);

        if(this.dataSourceDocentes.totalregistro != null)
          this.dataSourceBecarios.totalregistroglobal += this.dataSourceDocentes.totalregistro;

        this.buildPaginators(this.paginatorDocentes);
        this.buildPaginators(this.paginatorBecarios);
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

    buildForm(): void {
        this.form = this.formBuilder.group({
            idInstancia: [null],
            idSubinstancia: [null],
            codigoPlaza: [null],
            codigoCentroTrabajo: [null],
        });

        this.form.get("codigoPlaza").valueChanges.subscribe((value) => {
            if (this.plazaFiltroSeleccionado && this.plazaFiltroSeleccionado.codigo_plaza !== value) {
                this.plazaFiltroSeleccionado = null;
            }
        });

        this.form.get("codigoCentroTrabajo").valueChanges.subscribe((value) => {
            if (this.centroTrabajoFiltroSeleccionado && this.centroTrabajoFiltroSeleccionado.codigo_centro_trabajo !== value) {
                this.centroTrabajoFiltroSeleccionado = null;
            }
        });

        this.form.get("idInstancia").valueChanges.subscribe((value) => {
            let idNivelInstancia = null;
            let idInstancia = null;
            this.subinstancias = [];
            this.tiposCentroTrabajo = [];

            if (value === "-1") {
                return;
            }

            if (this.instancias.length !== 0 && value !== null && value !== undefined) {
                const data = this.instancias.find((x) => x.id_instancia === value);
                idNivelInstancia = parseInt(value.split("-")[0]);
                idInstancia = data.id;
            }

            this.form.patchValue({idSubinstancia: "-1",idTipoCentroTrabajo: "-1"});

            switch (idNivelInstancia) {
                case NivelInstanciaCodigoEnum.MINEDU: {
                    if (value) { }
                    break;
                }
                case NivelInstanciaCodigoEnum.DRE: {
                    if (value) {
                        this.loadSubInstancia(idInstancia, true);
                    }
                    break;
                }
            }
        });

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

    ocultarBreadCrumOriginal(){
        let div = document.getElementsByClassName('bread-original');
        for(let i = 0; i < div.length; i++) {
            const dv = div[i] as HTMLElement;
            dv.style.display = "none";
        }
    }

    obtenerPlazaContratacion(): void {
        let d = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.codSedeCabecera
        }
        
        this.dataService.Contrataciones().getObtenerPlazaContratacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                if (response.length > 0) {
		    this.idPlazaContratacion = response[0].idPlazaContratacion;
                    this.validacionPlaza = response[0].estadoValidacionPlaza;
                }
                else {
                    this.validacionPlaza = 'PENDIENTE';
                }
		if(this.validacionPlaza == "PRE PUBLICANDO PLAZAS") {
		    this.handleEvaluarCambioEstadoPrePublicacion();
		}
            }
        });
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Única");
        this.sharedService.setSharedTitle("Pre Publicación de Plazas");
    }

    handleBuscar = () => {
        this.buscarPlazasContratacion();
    };


    handleSelectTab = (e) => {
        this.selectedTabIndex = e.index;
        this.firstTime = true;
        this.handleBuscar();
    };

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
            console.log("Mobile activado? :", this.isMobile);
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        console.log("Redimension ventana cliente:", w);

        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    setRequest(): void {
        const formulario = this.form.getRawValue();

        let partesInstancia = formulario.idInstancia && formulario.idInstancia !== "-1" ? formulario.idInstancia.split("-") : [];
        let partesSubInstancia = formulario.idSubinstancia && formulario.idSubinstancia !== "-1" ? formulario.idSubinstancia.split("-") : [];
        let idNivelInstancia = partesInstancia[0] ? parseInt(partesInstancia[0]) : partesInstancia[0];
        let idInstancia = partesInstancia[1] ? parseInt(partesInstancia[1]) : partesInstancia[1];
        let idNivelSubInstancia = partesSubInstancia[0] ? parseInt(partesSubInstancia[0]) : partesSubInstancia[0];
        let idSubInstancia = partesSubInstancia[1] ? parseInt(partesSubInstancia[1]) : partesSubInstancia[1];
        let idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.id_plaza : null;
        let codigoPlaza = (formulario.codigoPlaza=="" || formulario.codigoPlaza==null)?null:formulario.codigoPlaza.toUpperCase();
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo==""?null:formulario.codigoCentroTrabajo;

        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idInstancia: idInstancia,
            idNivelInstancia: idNivelInstancia,
            idSubInstancia: idSubInstancia,
            idNivelSubInstancia: idNivelSubInstancia,
            idPlaza: idPlaza,
            codigoPlaza: codigoPlaza,
            idCentroTrabajo: idCentroTrabajo,
            codigoCentroTrabajo: codigoCentroTrabajo,
            idRegimenLaboral:RegimenLaboralEnum.LEY_30328,
            anio:this.anio
        };
    }

    buscarPlazasContratacion = () => {
        this.setRequest();
        if (this.request.codigoPlaza) {
            const codigoPlaza: string = this.request.codigoPlaza;
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (this.request.codigoCentroTrabajo) {
            const codigoCentroTrabajo: string = this.request.codigoCentroTrabajo;
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }

        if (this.selectedTabIndex == 0){
            this.buscarPlazasContratacionDocentes();
        }else{
            this.buscarPlazasContratacionBecarios();
        }
        this.firstTime = false;
    };

        private buscarPlazasContratacionDocentes = () => {
	    this.selectionDocentes = new SelectionModel<any>(true, []);
	    if(!this.buscarPaginator) this.paginatorDocentes.firstPage();
	    this.dataSourceDocentes.load(this.request,this.paginatorDocentes.pageIndex + 1, this.paginatorDocentes.pageSize, this.firstTime);
	    this.buscarPaginator=false;
        };

        private buscarPlazasContratacionBecarios = () => {
            this.selectionBecarios = new SelectionModel<any>(true, []);
	    if(!this.buscarPaginator)this.paginatorBecarios.firstPage();
            this.dataSourceBecarios.load(this.request, this.paginatorBecarios.pageIndex + 1, this.paginatorBecarios.pageSize , this.firstTime);
	    this.buscarPaginator=false;
        };

    handleExportar = () => {
        this.selectedTabIndex === 0 ? this.exportarPlazasContratacionDocentes() : this.exportarPlazasBecarios();
    };

    private exportarPlazasContratacionDocentes = () => {
        if (this.dataSourceDocentes.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }

        this.setRequest();
        if (this.request.codigoPlaza) {
            const codigoPlaza: string = this.request.codigoPlaza;
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (this.request.codigoCentroTrabajo) {
            const codigoCentroTrabajo: string = this.request.codigoCentroTrabajo;
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }

        let requestExportar: any = {
	    ...this.request ,
	    esBecario: false
        };

        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        var nombreExcel = "Plazas_Contratacion_Docentes";
        try{
            var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = nombreExcel+ ".xlsx";
        }
        // ************************************************************************************************


        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelPrePublicacionPlazas(requestExportar).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.descargarExcelBlob(response, nombreExportar);
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."',() => {});
            }
        });
    };

descargarExcelBlob = (array, nombreArchivo) => {
  let blob = new Blob([array], { type: 'application/vnd.ms-excel' });
  let a = document.createElement('a');
  let url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  window.URL.revokeObjectURL(url);
}
    private exportarPlazasBecarios = () => {
        if (this.dataSourceBecarios.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',() => {});
            return;
        }

        this.setRequest();
        if (this.request.codigoPlaza) {
            const codigoPlaza: string = this.request.codigoPlaza;
	    let validacionCodigoPlaza = criterioBusqueda.validarCodigoPlaza(codigoPlaza);
            if (!validacionCodigoPlaza.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoPlaza.mensaje);
                return;
            }
        }

        if (this.request.codigoCentroTrabajo) {
            const codigoCentroTrabajo: string = this.request.codigoCentroTrabajo;
	    let validacionCodigoTrabajo = criterioBusqueda.validarCodigoTrabajo(codigoCentroTrabajo);
            if (!validacionCodigoTrabajo.esValido) {
                this.dataService.Message().msgWarning(validacionCodigoTrabajo.mensaje);
                return;
            }
        }

        let requestExportar: any = {
	    ...this.request ,
	    esBecario:true 
        };
        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(fechaActual.getTime() - (fechaActual.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        var nombreExcel = "Plazas_Contratacion_Becarios";
        try{
            var nombreExportar:string = nombreExcel+" - "+dateString + ".xlsx"; //+(this.form.get('anio').value);
        }catch{
            var nombreExportar:string = nombreExcel+"" + ".xlsx";
        }
        // ***

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelPrePublicacionPlazas(requestExportar).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.descargarExcelBlob(response, nombreExportar);
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."',() => {});
            }
        });
    };

    loadInstancia = (activo) => {
        this.dataService.Contrataciones().getComboInstancia(activo).pipe(
            catchError(() => of([])),
            map((response: any) => response)
        )
        .subscribe((instancias) => {
            if (instancias) {
                this.instancias = instancias;
                this.form.controls["idInstancia"].setValue("-1");
            }
        });
    };

    loadSubInstancia = (idInstancia, activo) => {
        this.dataService.Contrataciones().getComboSubinstancia(idInstancia, activo).pipe(
            catchError(() => of([])),
            map((response: any) => response)
        )
        .subscribe((subinstancias) => {
            if (subinstancias) {
                this.subinstancias = subinstancias;
                this.form.controls["idSubinstancia"].setValue("-1");
		this.modelCriterioBusqueda.asignarActivoSubInstancia(false);
            }
        });
    };

    obtenerResumenPlazas = () => {
        this.dataService.Contrataciones().getResumenPlazas(this.request).pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response && response.result) {
                this.resumenPlazas = response.data;
            }
        });
    };

    handleLimpiar(): void {
        this.plazaFiltroSeleccionado = null;
        this.centroTrabajoFiltroSeleccionado = null;

        //this.centroTrabajoFiltroSeleccionado.id_centro_trabajo = null;
        this.resetForm();
        this.handleBuscar();
	    this.modelCriterioBusqueda.asignarActivoSubInstancia(true);
    }

    resetForm = () => {
        this.form.reset();
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "1300px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
                idEtapaProceso : this.idEtapaProceso,
		idRegimenLaboral: RegimenLaboralEnum.LEY_30328,
		codigoCentroTrabajo: CentroTrabajoEnum.MINEDU
            },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                console.log("resultado busqueda plazas", result);
                // this.form.get("codigoPlaza").setValue(result.plaza.codigo_plaza.trim());
                this.form.get("codigoPlaza").setValue(result.plaza.codigoPlaza.trim());
                this.plazaFiltroSeleccionado = { ...result.plaza };
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
                    idEtapaProceso : +this.route.snapshot.params.id,
                    codigoSede : this.codSedeCabecera,//this.currentSession.codigoSede, // prepublicacion 000000
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoCentroTrabajo").setValue(result.centroTrabajo.codigo_centro_trabajo);
                this.centroTrabajoFiltroSeleccionado = {
                    ...result.centroTrabajo,
                };
            }
        });
    };

    handlePrePublicar = () => {
        var request: any = {
            idEtapaProceso: this.idEtapaProceso,
            maestroProceso: 'CONTRATACIÓN DOCENTE',
            anio: this.fecha.getFullYear(),
            instancia: 'MINEDU',
            usuarioCreacion: 'ADMIN',
	    idPlazaContratacion:this.idPlazaContratacion,
	    idRegimenLaboral: RegimenLaboralEnum.LEY_30328,
	    codigoCentroTrabajoMaestro: CentroTrabajoEnum.MINEDU,
            idFlujoEstado : this.modelBandejaPublicacion.getIdFlujoEstado()
        };
        this.dataService.Message().msgConfirm(this.modelBandejaPublicacion.getconfirmationMessage(),
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().prepublicarPlazasEtapaPrePublicacion(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response > 0) {
			if(response == 1)
			{
                        //this.obtenerPlazaContratacion();
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {});
                        this.obtenerEstadoDesarrolloEtapa();
			this.handleEvaluarCambioEstadoPrePublicacion();
			}
			if(response == 2)
			{
			    this.dataService.Message().msgWarning(this.modelBandejaPublicacion.getMensajeValidacionTotalSiguienteEtapa());
			}
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL PRE PUBLICAR LAS PLAZAS."', () => {});
                    }
                });
            }, (error) => {}
        );
    }
    // handlePrePublicar = () => {
    //     var request: IGenerarPdfPlazasPrePublicadas = {
    //         idEtapaProceso: this.idEtapaProceso,
    //         maestroProceso: 'CONTRATACIÓN DOCENTE',
    //         anio: this.fecha.getFullYear(),
    //         instancia: 'AMAZONAS',
    //         usuarioCreacion: 'ADMIN'
    //     };

    //     const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA REALIZAR LA PRE PUBLICACIÓN DE LAS PLAZAS?</strong><br>Al pre publicar las plazas no se podrá enviar plazas para Becarios y también se generará el listado de las plazas en formato PDF.";
    //     this.dataService.Message().msgConfirm(confirmationMessage,
    //         () => {
    //             this.dataService.Spinner().show("sp6");
    //             this.dataService.Contrataciones().prepublicarPlazasEtapaPrePublicacion(request).pipe(
    //                 catchError((e) => of(e)),
    //                 finalize(() => {
    //                     this.dataService.Spinner().hide("sp6");
    //                 })
    //             )
    //             .subscribe((response) => {
    //                 if (response > 0) {
    //                     this.obtenerPlazaContratacion();
    //                     this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {});
    //                 } else {
    //                     this.dataService.Message().msgError('"OCURRIERON ERRORES AL PRE PUBLICAR LAS PLAZAS."', () => {});
    //                 }
    //             });
    //         }, (error) => {}
    //     );
    // }

    handleFinalizarEtapa = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        const request: IActualizarEtapaProcesoViewModel = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: 'ADMIN', 
            codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
        };
        console.log("Fnializar Etapa: ", request);
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE FINALIZAR LA ETAPA DE PREPUBLICACIÓN?',
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().registrarPlazaContratacionSiguienteEtapaPublicacion(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response > 0) {
                        // msgSuccess                        
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE FINALIZAR LA ETAPA."', () => {});
                    }
                });
            }, (error) => {}
        );
    }

    handleFinalizarEtapaDespuesDePrePublicar = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        const request: IActualizarEtapaProcesoViewModel = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: 'ADMIN', 
            //codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
            codigoCentroTrabajoMaestro: this.codSedeCabecera,//'000000'//this.currentSession.codigoSede, // como estamos en sede MINEDU, colocamos el codigo de minedu

        };
        console.log("Fnializar Etapa: ", request);
        this.dataService.Contrataciones().registrarPlazaContratacionSiguienteEtapaPublicacion(request).pipe(
            catchError((e) => of(e)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response) => {
            if (response > 0) {
                // msgSuccess                        
            } else {
                this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE FINALIZAR LA ETAPA."', () => {});
            }
        });
    }


    handleAperturarPrePublicar  = () => {

        let idProcesoEtapa = this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;

        this.dataService
            .Contrataciones()
            .obtenerFechaDeCortePrepublicacion(idProcesoEtapa, codSede)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
		if (response) {
		    this.fechaCorte = response.fechaDeCorte;
		    this.fechaFinNacional = response.fechaFinNacional;
		    this.nroEtapasIniciadas = +response.nroEtapasIniciadas;
		    if(this.fechaCorte)
			this.fechaCorteVisible = this.fechaCorte;

		    if(validarFechaPrePublicacion(this.fechaFinNacional)) return;
		    if(validarSiguienteEtapa(this.nroEtapasIniciadas)) return;
		    procesarApertura();
		}
            });
	    let validarFechaPrePublicacion = (fechaFinNacional:any) => {

		let fechaActual = new Date();
		let fFinNacional = ((new Date(fechaFinNacional).toISOString()).split('T')[0]).split('-')
		let fFinNacionalActividad = new Date(+fFinNacional[0],(+fFinNacional[1])-1,+fFinNacional[2]);
		let fActual =((fechaActual.toISOString()).split('T')[0]).split('-');
		let fFinActual= new Date(+fActual[0],(+fActual[1])-1,+fActual[2]);


		if(fFinActual > fFinNacionalActividad){
		    this.dataService
		    .Message()
		    .msgWarning('"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE FINALLIZÓ LA ACTIVIDAD PRE PUBLICACIÓN DE PLAZAS."');
		    return true;
		}
	    }
	     
	    let validarSiguienteEtapa = (nroEtapasIniciadas:any)=>{
		if(nroEtapasIniciadas>0){
		    this.dataService
		    .Message()
		    .msgWarning('"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE EL SIGUIENTE PROCESO SE HA INICIADO"');
		    return true;
		}
	    }

	    let procesarApertura = () =>{
		const request = {
		    idEtapaProceso: this.idEtapaProceso,
		    idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
		    usuarioModificacion: 'ADMIN',
		    codigoCentroTrabajoMaestro: this.codSedeCabecera,//'000000', // HARDCODE: REMOVE usar ENUM
                    idFlujoEstado : this.modelBandejaPublicacion.getIdFlujoEstado()
                };

		this.dataService
		.Message()
		.msgConfirm('¿ESTÁ SEGURO QUE DESEA REALIZAR LA APERTURA DE LA PRE PUBLICACIÓN DE PLAZAS?',
			    () => {
				this.dataService.Spinner().show("sp6");
				this.dataService
				    .Contrataciones()
				    .putAperturarPlazasPrepublicacion(request)
				    .pipe(
				    catchError((e) => of(e)),
					finalize(() => {
					this.dataService.Spinner().hide("sp6");
				    }))
				    .subscribe((response) => {
					if (response > 0) {
                                            this.dataService
                                                .Message()
                                                .msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {});
					    this.obtenerPlazaContratacion();
                                            this.obtenerFlujoEstado();
					} else {
					    this.dataService
					        .Message()
						.msgError('"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA PRE-PUBLICACION."', () => {});
					}
				    });
			    }, (error) => {}
			   );
	    }
        //let fechaActual = new Date();
	//let fFinNacional = ((new Date(this.fechaFinNacional).toISOString()).split('T')[0]).split('-')
	//let fFinNacionalActividad = new Date(+fFinNacional[0],(+fFinNacional[1])-1,+fFinNacional[2]);
	//let fActual =((fechaActual.toISOString()).split('T')[0]).split('-');
	//let fFinActual= new Date(+fActual[0],(+fActual[1])-1,+fActual[2]);
//
//
        //if(fFinActual > fFinNacionalActividad){
                //this.dataService
		    //.Message()
		    //.msgWarning('"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE FINALLIZÓ LA ACTIVIDAD PRE PUBLICACIÓN DE PLAZAS."');
		    //return;
	//}
//
        //if(this.nroEtapasIniciadas>0){
                //this.dataService
		    //.Message()
		    //.msgWarning('"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE EL SIGUIENTE PROCESO SE HA INICIADO"');
		    //return;
        //}

        //const request: IActualizarEtapaProcesoViewModel = {
            //idEtapaProceso: this.idEtapaProceso,
            //idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            //usuarioModificacion: 'ADMIN',
            //codigoCentroTrabajoMaestro: this.codSedeCabecera,//'000000', // HARDCODE: REMOVE usar ENUM
//
        //};
//
        //this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA REALIZAR LA APERTURA DE LA PRE PUBLICACIÓN DE PLAZAS?',
            //() => {
                //this.dataService.Spinner().show("sp6");
                //this.dataService.Contrataciones().putAperturarPlazasPrepublicacion(request).pipe(
                    //catchError((e) => of(e)),
                    //finalize(() => {
                        //this.dataService.Spinner().hide("sp6");
                    //})
                //)
                //.subscribe((response) => {
                    //if (response > 0) {
                        ////msgSuccess
                        //this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {});
                        //this.obtenerPlazaContratacion();
                    //} else {
                        //this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA PRE-PUBLICACION."', () => {});
                    //}
                //});
            //}, (error) => {}
        //);
    }

    handleVerPlazasPdf(becario: boolean) {
        if (!becario){
            // ModalDocumentosPublicadosPrepublicacionComponent
            this.dialogRef = this.materialDialog.open(ModalDocumentosPrepublicadosFechaComponent, {
                panelClass: 'minedu-modal-documentos-prepublicados-fecha',
                disableClose: true,
                data: {
                    idEtapaProceso: this.idEtapaProceso,
                    idGrupoDocumento: becario ?  GrupoDocumentoPublicadoEnum.PREPUBLICACIONBECARIOS : GrupoDocumentoPublicadoEnum.PREPUBLICACIONDOCENTES,
                    nombreDocumento: becario ?  'Plazas_para_Becarios' : 'Plazas_Contratación_Docente',
                    esbecario:becario,
                    dialogTitle:'Pre Publicación de plazas de contratación docente',
                    columnTitle:"Pre Publicación",
		    codigoCentroTrabajoMaestro: this.codSedeCabecera,
                    idIteracion:this.modelBandejaPublicacion.getIteracion()
                }
            });
        } else
        {
            this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent, {
                panelClass: 'minedu-modal-documentos-publicados',
                disableClose: true,
                data: {
                    idEtapaProceso: this.idEtapaProceso,
                    idGrupoDocumento: becario ?  GrupoDocumentoPublicadoEnum.PREPUBLICACIONBECARIOS : GrupoDocumentoPublicadoEnum.PREPUBLICACIONDOCENTES,
                    nombreDocumento: becario ?  'Plazas_para_Becarios' : 'Plazas_Contratación_Docente',
                    esbecario:becario,
                    dialogTitle:"Pre Publicación de plazas para becarios",
                    columnTitle:"Pre Publicación",
		    codigoCentroTrabajoMaestro: this.codSedeCabecera,
                    idIteracion:this.modelBandejaPublicacion.getIteracion()
                }
            });
        }
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            }
        );
    }

    // handleVerPlazasPdf(becario: boolean) {
    //     this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent, {
    //         panelClass: 'modal-documentos-publicados-dialog',
    //         disableClose: true,
    //         data: {
    //             idEtapaProceso: this.idEtapaProceso,
    //             idGrupoDocumento: becario ?  GrupoDocumentoPublicadoEnum.PREPUBLICACIONBECARIOS : GrupoDocumentoPublicadoEnum.PREPUBLICACIONDOCENTES,
    //             nombreDocumento: becario ?  'Plazas_Publicadas_Becarios' : 'Plazas_Publicadas_Contratacion_Docentes',
    //         }
    //     });
    
    //     this.dialogRef.afterClosed()
    //         .subscribe((response: any) => {
    //             if (!response) {
    //                 return;
    //             }
    //         }
    //     );
    // }

    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
    };

    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = true;

        this.currentSession = this.dataService.Storage().getInformacionUsuario();

        // SOLUCION A CODIGOS DE SEDE DIFERENTES EN EL  SERVICIO PASSPORT // ya no tenemos este problema, se ha solucionado desde passport y bd
        /*if (this.currentSession.codigoTipoSede === TablaEquivalenciaSede.CODIGO_TIPO_SEDE)
        {
            this.currentSession.codigoSede =  TablaEquivalenciaSede.CODIGO_SEDE;
        }*/

        // Recuperar Detalles de Seguridad para controles
        this.buildSeguridadControles(this.currentSession.codigoRol, this.currentSession.codigoTipoSede);
        
    };

    // TODO : CLEAN HARDCODE
    buildSeguridadControles = (codigoRol:string, codigoTipoSede:string) => {

        // Shamar a Servicio
        const data = { 
            codRol : codigoRol, 
            codTipoSede : codigoTipoSede, 
            idEtapaProceso : this.idEtapaProceso,
        }
        //getPrepublicacionBotonesActivos
        this.dataService.Contrataciones().getObtenerAccesoUsuariosValidacionPlazas(data).pipe(
            catchError(() => of([])),
            finalize(() => {
                // this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((result: any) => {
            if (result) {
                console.log("Resultado antes asignar Permisos Botonoes",result);
                // this.botonesActivos = result;
                // console.log("Resultado despues asignar, botonesActivos", this.botonesActivos);

                //this.handleBuscar();
		 this.controlesActivos = { 
		     btnFinalizarEtapa : true, 
		     btnAperturaEtapa : result.aperturarPrepublicacion, 
		     btnIncorporarPlazas: result.incorporarPlazas, 
		     btnPrePublicarPlazas:result.prePublicarPlazas, 
		     btnPlazaBecarios:result.plazaBecarios, 
		     btnPlazaContratacionDocente:result.plazasContratacionDocente,
		     btnVerPlazasPDF:true, 
		     btnExportar:true 
		 }; 
            } else {
                this.dataService.Message().msgError('"ERROR, NO TIENE PERMISOS PARA ACCEDER A ESTE MODULO."',() => {
                    // Redirigir a pagina princioap
                });
            }
        }); 
    }

    isAllSelectedDocentes = () => {
        const numSelected = this.selectionDocentes.selected.length;
        const numRows = this.dataSourceDocentes.data.length;
        return numSelected === numRows;
    };

    masterToggleDocentes = () => {
        this.isAllSelectedDocentes() ? this.selectionDocentes.clear() : this.dataSourceDocentes.data.forEach((row) =>
            this.selectionDocentes.select(row)
        );
    };

    checkboxLabelDocentes(row?: any): string {
        if (!row) { return `${this.isAllSelectedDocentes() ? "deselect" : "select"} all`; }
        return `${this.selectionDocentes.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    isAllSelectedBecarios = () => {
        const numSelected = this.selectionBecarios.selected.length;
        const numRows = this.dataSourceBecarios.data.length;
        return numSelected === numRows;
    };

    masterToggleBecarios = () => {
        this.isAllSelectedBecarios() ? this.selectionBecarios.clear() : this.dataSourceBecarios.data.forEach((row) =>
            this.selectionBecarios.select(row)
        );
    };

    checkboxLabelBecarios(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedBecarios() ? "deselect" : "select"} all`;
        }
        return `${this.selectionBecarios.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }

    handlePlazaBecarios = () => {
        const seleccionados = this.selectionDocentes.selected || [];

        if (!((this.isAllSelectedDocentes() && this.dataSourceDocentes.totalregistro) || seleccionados.length)) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {}); // M91
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA TRASLADAR LAS PLAZAS A LA PESTAÑA “PLAZAS BECARIOS”?', // M106
            () => {
                const request: IActualizarPlazaContratacionSiEsBecarioViewModel =
                {
                    esBecarioOrigen: false,
                    esBecarioDestino: true,
                    marcarTodos: false,
                    idEtapaProceso: this.idEtapaProceso,
                    idPlazaContratacion: seleccionados[0].id_plaza_contratacion,
                    usuarioModificacion: "ADMIN",
                    plazas: seleccionados.map((s) => {
                        return {
                            idPlazaContratacionDetalle: s.id_plaza_contratacion_detalle,
                            idPlaza: s.id_plaza
                        };
                    }),
                };

                this.dataService.Contrataciones().actualizarPlazaContratacionSiEsBecario(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        //msgSuccess
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {});
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE CAMBIAR EL TIPO DE PLAZA."',() => {});
                    }
                });
            }
        );
    }

    handlePlazaContratacionDocente = () => {
        const seleccionados = this.selectionBecarios.selected || [];

        if (!((this.isAllSelectedBecarios() && this.dataSourceBecarios.totalregistro) || seleccionados.length)) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {});
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA TRASLADAR LAS PLAZAS A LA PESTAÑA “PLAZAS CONTRATACIÓN DOCENTE”?',
            () => {
                const request: IActualizarPlazaContratacionSiEsBecarioViewModel =
                {
                    esBecarioOrigen: true,
                    esBecarioDestino: false,
                    marcarTodos: false,
                    idEtapaProceso: this.idEtapaProceso,
                    idPlazaContratacion: seleccionados[0].id_plaza_contratacion,
                    usuarioModificacion: "ADMIN",
                    plazas: seleccionados.map((s) => {
                        return {
                            idPlazaContratacionDetalle: s.id_plaza_contratacion_detalle,
                            idPlaza: s.id_plaza,
                        };
                    }),
                };

                this.dataService.Contrataciones().actualizarPlazaContratacionSiEsBecario(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        // msgAutoSuccess // (sin boton) - mensaje en la parte superior derecha
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {                           
                        });
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE CAMBIAR EL TIPO DE PLAZA."',() => {});
                    }                    
                });
            }
        );
    }

    handleViewInfo = (id) => {
        this.dialogRef = this.materialDialog.open(InformacionPlaza30328Component, {
            panelClass: "informacion-plaza-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idPlaza: id,
                anio:this.anio
            },
        });
    }

    handleIncorporarPlazas() {
        const data = {
            idEtapaProceso : this.idEtapaProceso,
            codigoCentroTrabajoMaestro:this.codSedeCabecera,//'000000',
            fragmentoUrlRetornar:'prepublicacion'
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
                textosConcatenadosConGuion:encodeURIComponent('Prepublicación-TextoComplemento'),
                idEstadoDesarrollo: this.idEstadoDesarrollo
	    },
        ]);

        /*
        this.dialogRef = this.materialDialog.open(ModalIncorporacionPlazasComponent, {
            panelClass: "modal-incorporacion-plaza-dialog",
            width: "100%",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                verInstanciaSubinstancia: true,
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });*/


    }
    handleIncorporarPlazasPorModal() {
        this.dialogRef = this.materialDialog.open(ModalIncorporacionPlazasComponent, {
            panelClass: "modal-incorporacion-plaza-dialog",
            width: "100%",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                verInstanciaSubinstancia: true,
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                this.handleBuscar();
            } else {
                return;
            }
        });
    }

    handleEliminarPlazaIncorporada(row, i){
        //  console.log("eliminando plaza incorporada A ", i, " :",row);

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR LA INFORMACIÓN?',
            () => {
                this.dataService.Spinner().show("sp6");
                console.log("eliminando plaza incorporada A ", i, " :",row);
                console.log("eliminando plaza c detalle :", row.id_plaza_contratacion_detalle);
                // ****************************************************************
                let request: any =
                {
                    idPlazaContratacionDetalleIncorporada: row.id_plaza_contratacion_detalle,
                    codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                    codigoRolPassport: this.currentSession.codigoRol,
                    idEtapaProceso: this.idEtapaProceso,
                    ipCreacion: '',
                    usuarioModificacion: "ADMIN",
                };

                this.dataService.Contrataciones().eliminarPlazaIncorporada(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result: number) => {
                    if (result) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {                           
                        });
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE ELIMINAR PLAZA."',() => {});
                    }                    
                });
                // ****************************************************************

                this.dataService.Spinner().hide("sp6");                
            }, (error) => {}
        );
        
    }
    obtenerEstadoDesarrolloEtapa = () => {
        let idProcesoEtapa = this.route.snapshot.params.id;
        let codSede = this.codSedeCabecera;//'000000';//this.currentSession.codigoSede;

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
                }
            });
            
    };

    obtenerEstadoJobEjecutado(){
        // getVerificarEjecucionJobPlazas
        let idProcesoEtapa = +this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;
        console.log("Antes de ingresar a servicio",idProcesoEtapa);

        this.dataService
            .Contrataciones()
            .getVerificarEjecucionJobPlazas(idProcesoEtapa)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log("Respusta JOb ejecutado", response);
                    this.jobEjecutado = response.resultadoValidacion;
                    // this.jobEjecutado = true; // activado para realizar pruebas de flujo
                }
            // console.log("Estado de desarrollo : ", this.estadoDesarrollo);
            });
    }

    obtenerFechaDeCortePrepublicacion = () => {
        let idProcesoEtapa = this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;

        this.dataService
            .Contrataciones()
            .obtenerFechaDeCortePrepublicacion(idProcesoEtapa, codSede)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log("obtener fecha corte:",response);
                    this.fechaCorte = response.fechaDeCorte;
                    this.fechaFinNacional = response.fechaFinNacional;
                    this.nroEtapasIniciadas = +response.nroEtapasIniciadas;
                    if(this.fechaCorte)
                       this.fechaCorteVisible = this.fechaCorte;
                }
            });
    };

    handleActualizarEstado = ()=> this.obtenerPlazaContratacion();
    
    handleEvaluarCambioEstadoPrePublicacion =()=>{
	this.ocultarLoader = true; 
	this.validacionPlaza ="PRE PUBLICANDO PLAZAS";
	const interval = setInterval(() => {
	    let d = {
		idEtapaProceso: this.idEtapaProceso,
		codigoCentroTrabajoMaestro: this.codSedeCabecera
	    }
	    this.dataService.Contrataciones().getObtenerPlazaContratacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
		finalize(() => {})
	    )
	    .subscribe((response: any) => {
		if (response) {
			this.idPlazaContratacion = response[0].idPlazaContratacion;
			this.validacionPlaza = response[0].estadoValidacionPlaza;
                          this.obtenerFlujoEstado();
			if(this.validacionPlaza !="PRE PUBLICANDO PLAZAS") {
                          this.obtenerFlujoEstado();
			    this.ocultarLoader = false; 
			  clearInterval(interval);
			}
		}
	    });
	},10000);
    }

    obtenerFlujoEstado (){
        let data = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: CentroTrabajoEnum.MINEDU,
            codigoTipoAccion: TipoAccionEnum.PLAZA,
            codigoEstadoInformacion: FlujoEstadoEnum.PENDIENTE,
        }
        this.dataService.Contrataciones()
	    .getFlujoEstado(data)
	    .pipe(
		 catchError(() => { return of(null); })
	     )
	    .subscribe(this.modelBandejaPublicacion.setFlujoEstado);
    }

    handleInformacionDesarrolloProceso = ({idEstadoDesarrollo}) =>{
      this.idEstadoDesarrollo = idEstadoDesarrollo;
    }
}

export class PlazasContratacionDocentesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    public totalregistroglobal=0;

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
            data.esBecario = false;
            this.dataService.Contrataciones().buscarPlazasContratacionPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
                console.log("DataSource plazasContratacion response: ", plazasContratacion);
                this.totalregistroglobal += this.totalregistro; // *******************

                if (((plazasContratacion || []).length === 0 || this.totalregistroglobal === 0) && !firstTime) {
                    // this.dataService.Message().msgWarning('"NO SE ENCONTRÓ PLAZAS DE CONTRATACIÓN DOCENTE PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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

export class PlazasContratacionBecariosDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    public totalregistroglobal=0;


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
            data.esBecario = true;

            this.dataService.Contrataciones().buscarPlazasContratacionPaginado(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((plazasContratacion: any) => {
                this._dataChange.next(plazasContratacion || []);
                this.totalregistro = (plazasContratacion || []).length === 0 ? 0 : plazasContratacion[0].total_registros;
                this.totalregistroglobal += this.totalregistro; 

                if (((plazasContratacion || []).length === 0 || this.totalregistroglobal === 0) && !firstTime) {
                    // this.dataService.Message().msgWarning('"NO SE ENCONTRÓ PLAZAS DE CONTRATACIÓN DOCENTE PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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

interface ControlesActivos{
    btnFinalizarEtapa : boolean,
    btnAperturaEtapa : boolean,
    btnIncorporarPlazas: boolean,
    btnPrePublicarPlazas:boolean,
    btnPlazaBecarios:boolean,
    btnVerPlazasPDF:boolean,
    btnExportar:boolean,
    btnPlazaContratacionDocente:boolean
}
