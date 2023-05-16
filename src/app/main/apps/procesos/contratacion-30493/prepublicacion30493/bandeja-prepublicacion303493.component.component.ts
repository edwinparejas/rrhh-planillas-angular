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
import { ResumenPlazasResponseModel,NivelInstanciaCodigoEnum,IActualizarPlazaContratacionSiEsBecarioViewModel,IGenerarPdfPlazasPrePublicadas,IActualizarPlazaPrePublicacionViewModel, IActualizarEtapaProcesoViewModel, IPlazasContratacion } from "../models/contratacion.model";
import { MatDialog } from "@angular/material/dialog";
import { BusquedaPlazaComponent } from "../../contratacion/components/busqueda-plaza/busqueda-plaza.component";
import { BuscarCentroTrabajoComponent } from "../../contratacion/components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { TablaEquivalenciaSede, TablaPermisos } from "app/core/model/types";
import { SecurityModel } from "app/core/model/security/security.model";
import { CentroTrabajoModel } from "app/core/model/centro-trabajo.model";
import { SharedService } from "../../../../../core/shared/shared.service";
import { TipoFormatoPlazaEnum, EstadoEtapaProcesoEnum, GrupoDocumentoPublicadoEnum } from "../_utils/constants";
import { descargarExcel } from "app/core/utility/functions";
import { InformacionPlaza30493Component } from "./informacion-plaza/informacion-plaza30493.component";
import { ModalDocumentosPublicadosComponent } from "../../contratacion/components/modal-documentos-publicados/modal-documentos-publicados.component";
import { PASSPORT_MESSAGE } from "app/core/model/message";
import { ModalIncorporacionPlazasComponent } from "../../contratacion/contrataciondirecta/bandeja-incorporacion-plazas/modal-incorporacion-plazas/modal-incorporacion-plazas.component";


@Component({
  selector: 'minedu-bandeja-prepublicacion30493',
  templateUrl: './bandeja-prepublicacion30493.component.html',
  styleUrls: ['./bandeja-prepublicacion30493.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPrepublicacion30493Component implements OnInit {
    soloLectura = true;
    dataSourceDocentes: PlazasContratacionDocentesDataSource | null;
    fecha = new Date();
    paginatorDocentesPageSize = 10;
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
        "modalidad",
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
        "modalidad",
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
    validacionPlaza: string;
    dialogRef: any;
    selectedTabIndex = 0;
    resumenPlazas: ResumenPlazasResponseModel;

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
    };

    instancias: any[];
    subinstancias: any[];
    tiposCentroTrabajo: any[];
    plazaFiltroSeleccionado: any;
    centroTrabajoFiltroSeleccionado: any;

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
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.buildForm();
        this.buildGrids();
        this.buildSeguridad();
        this.handleResponsive();
        this.obtenerPlazaContratacion();
        this.loadInstancia(true);
    }

    ngAfterViewInit() {
        this.paginatorDocentes.page.pipe(tap(() => this.handleBuscar())).subscribe();
        this.paginatorBecarios.page.pipe(tap(() => this.handleBuscar())).subscribe();
    }

    buildGrids(): void {
        this.dataSourceDocentes = new PlazasContratacionDocentesDataSource(this.dataService);
        this.dataSourceBecarios = new PlazasContratacionBecariosDataSource(this.dataService);
        this.buildPaginators(this.paginatorDocentes);
        this.buildPaginators(this.paginatorBecarios);
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Filas por tabla";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
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

        setTimeout((_) => this.handleBuscar());
    }

    obtenerPlazaContratacion(): void {
        let d = {
            idEtapaProceso: this.idEtapaProceso
        }
        
        this.dataService.Contrataciones().getObtenerPlazaContratacionPorIdEtapaProceso(d).pipe(catchError((e) => of([e])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            if (response) {
                if (response.length > 0) {
                    this.validacionPlaza = response[0].estadoValidacionPlaza;
                }
                else {
                    this.validacionPlaza = 'PENDIENTE';
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

    setRequest(): void {
        const formulario = this.form.getRawValue();

        let partesInstancia = formulario.idInstancia && formulario.idInstancia !== "-1" ? formulario.idInstancia.split("-") : [];
        let partesSubInstancia = formulario.idSubinstancia && formulario.idSubinstancia !== "-1" ? formulario.idSubinstancia.split("-") : [];
        let idNivelInstancia = partesInstancia[0] ? parseInt(partesInstancia[0]) : partesInstancia[0];
        let idInstancia = partesInstancia[1] ? parseInt(partesInstancia[1]) : partesInstancia[1];
        let idNivelSubInstancia = partesSubInstancia[0] ? parseInt(partesSubInstancia[0]) : partesSubInstancia[0];
        let idSubInstancia = partesSubInstancia[1] ? parseInt(partesSubInstancia[1]) : partesSubInstancia[1];
        let idPlaza = this.plazaFiltroSeleccionado ? this.plazaFiltroSeleccionado.id_plaza : null;
        let codigoPlaza = formulario.codigoPlaza;
        let idCentroTrabajo = this.centroTrabajoFiltroSeleccionado ? this.centroTrabajoFiltroSeleccionado.id_centro_trabajo : null;
        let codigoCentroTrabajo = formulario.codigoCentroTrabajo;

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
        };
    }

    buscarPlazasContratacion = () => {
        this.setRequest();

        if (this.request.codigoPlaza != null) {
            const codigoPlaza: string = this.request.codigoPlaza;
            if (codigoPlaza.length < 12) {
                this.dataService.Message().msgWarning('"CÓDIGO NO VÁLIDO, DEBE INGRESAR UN CÓDIGO DE PLAZA CON DOCE (12) DÍGITOS."', () => {});
                return;
            }
        }

        if (this.request.codigoCentroTrabajo != null) {
            const codigoCentroTrabajo: string = this.request.codigoCentroTrabajo;
            if (codigoCentroTrabajo.length < 7) {
                this.dataService.Message().msgWarning('"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN CÓDIGO CON SIETE (7) DÍGITOS."', () => {} );
                return;
            }
        }
        this.buscarPlazasContratacionDocentes();
        this.buscarPlazasContratacionBecarios();
    };

    private buscarPlazasContratacionDocentes = () => {
        this.selectionDocentes = new SelectionModel<any>(true, []);
        this.dataSourceDocentes.load(this.request, this.paginatorDocentes.pageIndex + 1, this.paginatorDocentes.pageSize);
    };

    private buscarPlazasContratacionBecarios = () => {
        this.selectionBecarios = new SelectionModel<any>(true, []);
        this.dataSourceBecarios.load(this.request, this.paginatorBecarios.pageIndex + 1, this.paginatorBecarios.pageSize);
    };

    handleExportar = () => {
        this.selectedTabIndex === 0 ? this.exportarPlazasContratacionDocentes() : this.exportarPlazasBecarios();
    };

    private exportarPlazasContratacionDocentes = () => {
        if (this.dataSourceDocentes.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {});
            return;
        }

        let requestExportar: any = { 
            idEtapaProceso: this.idEtapaProceso,
            esBecario: false 
        };

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelPrePublicacionPlazas(requestExportar).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, "Plazas_Contratacion_Docentes.xlsx");
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."',() => {});
            }
        });
    };

    private exportarPlazasBecarios = () => {
        if (this.dataSourceBecarios.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',() => {});
            return;
        }

        let requestExportar: any = { 
            idEtapaProceso: this.idEtapaProceso,
            esBecario: true 
        };

        this.dataService.Spinner().show("sp6");
        this.dataService.Contrataciones().exportarExcelPrePublicacionPlazas(requestExportar).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, "Plazas_Contratacion_Becarios.xlsx");
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
        this.resetForm();
    }

    resetForm = () => {
        this.form.reset();
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
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
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1000px",
                disableClose: true,
                data: {
                    action: "requerimiento",
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
        var request: IGenerarPdfPlazasPrePublicadas = {
            idEtapaProceso: this.idEtapaProceso,
            maestroProceso: 'CONTRATACIÓN DOCENTE',
            anio: this.fecha.getFullYear(),
            instancia: 'AMAZONAS',
            usuarioCreacion: 'ADMIN'
        };

        const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA REALIZAR LA PRE PUBLICACIÓN DE LAS PLAZAS?</strong><br>Al pre publicar las plazas no se podrá enviar plazas para Becarios y también se generará el listado de las plazas en formato PDF.";
        this.dataService.Message().msgConfirm(confirmationMessage,
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
                        this.obtenerPlazaContratacion();
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL PRE PUBLICAR LAS PLAZAS."', () => {});
                    }
                });
            }, (error) => {}
        );
    }

    handleFinalizarEtapa = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        const request: IActualizarEtapaProcesoViewModel = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: 'ADMIN', 
            codigoCentroTrabajo: this.currentSession.codigoSede,
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
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA ETAPA."', () => {});
                    }
                });
            }, (error) => {}
        );
    }

    handleAperturarPrePublicar  = () => {
        const request: IActualizarEtapaProcesoViewModel = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: 'ADMIN'
        };

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE APERTURAR LA ETAPA DE PREPUBLICACIÓN?',
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().putAperturarPlazasPrepublicacion(request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response) => {
                    if (response > 0) {
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', () => {});
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA PRE-PUBLICACION."', () => {});
                    }
                });
            }, (error) => {}
        );
    }

    handleVerPlazasPdf(becario: boolean) {
        this.dialogRef = this.materialDialog.open(ModalDocumentosPublicadosComponent, {
            panelClass: 'modal-documentos-publicados-dialog',
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idGrupoDocumento: becario ?  GrupoDocumentoPublicadoEnum.PREPUBLICACIONBECARIOS : GrupoDocumentoPublicadoEnum.PREPUBLICACIONDOCENTES,
                nombreDocumento: becario ?  'Plazas_Publicadas_Becarios' : 'Plazas_Publicadas_Contratacion_Docentes',
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            }
        );
    }

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

        // SOLUCION A CODIGOS DE SEDE DIFERENTES EN EL  SERVICIO PASSPORT
        if (this.currentSession.codigoTipoSede === TablaEquivalenciaSede.CODIGO_TIPO_SEDE)
        {
            this.currentSession.codigoSede =  TablaEquivalenciaSede.CODIGO_SEDE;
        }

        this.buildSeguridadControles(this.currentSession.codigoRol, this.currentSession.codigoSede);
        // if (!this.permisos.autorizadoConsultar) { // Verificar permisos
        //     this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        //     return;
        // }
        // console.log("Autorizado!")
    };

    // TODO : CLEAN HARDCODE
    buildSeguridadControles = (codigoRol:string, codigoSede:string) => {

        // Shamar a Servicio
        const data = { 
            codigoRol : codigoRol, 
            codigoSede : codigoSede, 
            idEtapaProceso : this.idEtapaProceso,
        }
        this.dataService.Contrataciones().getControlesHabilitados(data).pipe(
            catchError(() => of([])),
            finalize(() => {
                // this.dataService.Spinner().hide("sp6");
            })
        )
        .subscribe((result: number) => {
            if (result) {
                // this.controlesActivos = result;
                this.handleBuscar();
            } else {
                this.dataService.Message().msgError('"ERROR, NO TIENE PERMISOS PARA ACCEDER A ESTE MODULO."',() => {
                    // Redirigir a pagina princioap
                });
            }
        }); 
         switch(codigoRol){
             case "AYNI_006": { this.controlesActivos = { btnFinalizarEtapa : true, btnAperturaEtapa : true, btnIncorporarPlazas: true, btnPrePublicarPlazas:true, btnPlazaBecarios:true, btnVerPlazasPDF:true, btnExportar:true }; break;}
        //     case "AYNI_019": { this.controlesActivos = { btnFinalizarEtapa : false, btnAperturaEtapa : true, btnIncorporarPlazas: false, btnPrePublicarPlazas:false, btnPlazaBecarios:false, btnVerPlazasPDF:true, btnExportar:true }; break;}
        //     case "AYNI_004": { this.controlesActivos = { btnFinalizarEtapa : false, btnAperturaEtapa : false, btnIncorporarPlazas: false, btnPrePublicarPlazas:false, btnPlazaBecarios:false, btnVerPlazasPDF:true, btnExportar:true }; break;}
        //     case "AYNI_030": { this.controlesActivos = { btnFinalizarEtapa : false, btnAperturaEtapa : false, btnIncorporarPlazas: false, btnPrePublicarPlazas:false, btnPlazaBecarios:false, btnVerPlazasPDF:true, btnExportar:true }; break;}
         }
        console.log("ControlesActivos: ", this.controlesActivos," - ", codigoRol , " - ", this.soloLectura);
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
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR AL MENOS UNA PLAZA."', () => {});
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE DESEA TRASLADAR LAS PLAZAS A LA PESTAÑA "PLAZAS BECARIOS"?',
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
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',() => {});
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
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR AL MENOS UNA PLAZAS."', () => {});
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE DESEA TRASLADAR LAS PLAZAS A LA PESTAÑA "PLAZAS CONTRATACION DOCENTE"?',
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
                        this.dataService.Message().msgSuccess('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',() => {});
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE CAMBIAR EL TIPO DE PLAZA."',() => {});
                    }                    
                });
            }
        );
    }

    handleViewInfo = (id) => {
        this.dialogRef = this.materialDialog.open(InformacionPlaza30493Component, {
            panelClass: "informacion-plaza-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                idPlaza: id
            },
        });
    }

    handleIncorporarPlazas() {
        this.dialogRef = this.materialDialog.open(ModalIncorporacionPlazasComponent, {
            panelClass: "modal-incorporacion-plaza-dialog",
            width: "100%",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso
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
        // console.log("eliminando plaza incorporada A ", i, " :",row);

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA QUITAR LA PLAZA INCORPORADA?',
            () => {
                this.dataService.Spinner().show("sp6");
                console.log("eliminando plaza incorporada A ", i, " :",row);
                this.dataService.Spinner().hide("sp6");                
            }, (error) => {}
        );
        
    }

}

export class PlazasContratacionDocentesDataSource extends DataSource<any> {
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
                if ((plazasContratacion || []).length === 0) {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ PLAZAS DE CONTRATACIÓN DOCENTE PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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
                if ((plazasContratacion || []).length === 0) {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ PLAZAS DE BECARIOS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
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
}