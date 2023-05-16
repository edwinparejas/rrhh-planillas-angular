import { SelectionModel } from "@angular/cdk/collections";
import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/core/data/data.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { of } from "rxjs";
import {
    IActualizarEtapaProcesoViewModel,
    IActualizarPlazaContratacionSiEsBecarioViewModel,
    plazaBotonesGrillaActivos_30493,
} from "../../models/contratacion.model";
import { InformacionPlaza30328Component } from "../../prepublicacion30328/informacion-plaza/informacion-plaza30328.component";
import {
    EstadoEtapaProcesoEnum,
    GrupoDocumentoPublicadoEnum,
    MensajesSolicitud,
    RegimenLaboralEnum,
    SituacionPlazasEnum,
} from "../../_utils/constants";
import { ModalDocumentosPublicadosPrepublicacionComponent } from "../modal-documentos-publicados-prepublicacion/modal-documentos-publicados-prepublicacion.component";
import { descargarExcel } from "app/core/utility/functions";
import { catchError, finalize, tap } from "rxjs/operators";
import { mineduAnimations } from "@minedu/animations/animations";
import { ModalPlazaObservadaEvalExpComponent } from "../../contratacionevaluacion/bandeja-plazas-evaluacion/modal-plaza-observada-eval-exp/modal-plaza-observada-eval-exp.component";
import { ResultadoOperacionEnum } from "app/core/model/types";

@Component({
    selector: "minedu-grilla-plazas30493",
    templateUrl: "./grilla-plazas30493.component.html",
    styleUrls: ["./grilla-plazas30493.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class GrillaPlazas30493Component implements OnInit {
    @Output() eventSearch = new EventEmitter<any>();
    nroEtapasIniciadas: number = 0;
    paginatorBecariosPageSize = 10;
    paginatorBecariosPageIndex = 0;
    displayedColumnsBecarios: string[] = [
        "registro",
        "codigo_modular",
        // "instancia",
        // "subinstancia",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        // "area_curricular",
        // "tipo_plaza",
        // "vigencia_inicio",
        // "vigencia_fin",
        "resultado_final",
        "acciones",
    ];
    selectionBecarios = new SelectionModel<any>(true, []);
    paginatorDocentesPageSize = 10;
    paginatorDocentesPageIndex = 0;

    mostrarResultadoFinal:boolean = false;
    visibleMigrarPlaza:boolean=true;

    displayedColumnsDocentes: string[] = [
        "registro",
        "codigo_modular",
        // "instancia",
        // "subinstancia",
        "centro_trabajo",
        "modalidad",
        "nivel_educativo",
        "tipo_gestion",
        "codigo_plaza",
        "cargo",
        // "area_curricular",
        // "tipo_plaza",
        // "vigencia_inicio",
        // "vigencia_fin",
        "resultado_final",
        "acciones",
    ];


    selectionDocentes = new SelectionModel<any>(true, []);
    isAllSelectionDocentes: boolean = false;
    notSelectionDocentes: any[] = [];

    selectedTabIndex = 0;
    currentSession: SecurityModel = new SecurityModel();
    validacionPlaza: string;
    soloLectura = true;

    @Output() eventPaginator = new EventEmitter<any>();
    @Output() eventDelete = new EventEmitter<any>();
    @Input() dataSourceDocentes: any;
    @Input() codSedeCabecera: string;
    @Input() esResultadoFinal: boolean;
    @Input() plazaBotonesGrillaActivos : plazaBotonesGrillaActivos_30493 = {
            btnMigrarPlazasDesiertas : false,
            btnIncorporarPlazas : false,
            btnPlazasConvocar : false,
            btnPlazasObservados:false,
            btnExportar : true,
    };
    @Input() indiceSeleccionado:number;
    numeroConvocatoria:string;

    controlesActivos: ControlesActivos = {
        btnFinalizarEtapa: true,
        btnAperturaEtapa: true,
        btnIncorporarPlazas: true,
        btnPrePublicarPlazas: true,
        btnPlazaBecarios: true,
        btnVerPlazasPDF: true,
        btnExportar: true,
    };
    estadoDesarrollo: any;
    jobEjecutado = false;
    idEtapaProceso: number;
    fecha = new Date();
    // codSedeCabecera: string = "000000"; // added
    dialogRef: any;
    isMobile = false;
    @ViewChild("paginatorDocentes", { static: true })
    paginatorDocentes: MatPaginator;
    @ViewChild("paginatorBecarios", { static: true })
    paginatorBecarios: MatPaginator;
    fechaFinNacional: Date;

    constructor(
        private route: ActivatedRoute,
        private dataService: DataService,
        private router: Router,
        private materialDialog: MatDialog
    ) {}

    ngOnInit(): void {
        if (this.route.routeConfig.path.search("ver-prepublicacion/") > -1) {
            this.soloLectura = true;
        } else {
            this.soloLectura = false;
        }
        this.setUpVariables();
        this.buildGrids();
        this.eventPaginator.emit({
            pageIndex: 0,
            pageSize: 10,
        });
        this.obtenerDatosEtapa();
        // console.log("plazaBotonesGrillaActivosPrepublicados grilla ngInit", this.plazaBotonesGrillaActivos)
    }
    
    obtenerEstadoDesarrolloEtapa = () => {
        if(this.codSedeCabecera==undefined) {
            this.codSedeCabecera = '000000'
        }

        this.dataService
            .Contrataciones()
            .obtenerCabeceraEstadoDesarrolloEtapaProceso(this.idEtapaProceso, this.codSedeCabecera)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    // console.log("Estado Desarrollo Grilla: ", response)
                    this.numeroConvocatoria = response.numeroConvocatoria;
                    //this.etapaResponse.descripcionEstadoEtapaProceso = response.estadoDesarrollo;
                }
            });
    };

    obtenerDatosEtapa = () => {
        this.dataService
            .Contrataciones()
            .obtenerCabeceraEtapaProcesoById(this.idEtapaProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    console.log("Grilla response", response);
                    this.numeroConvocatoria = response.numero_convocatoria;
                }
            });
    };

    setUpVariables = () => {
        this.idEtapaProceso = parseInt(this.route.snapshot.params.id);
        this.plazaBotonesGrillaActivos.btnExportar
    };

    buildGrids(): void {
        this.buildPaginators(this.paginatorDocentes);
    }

    ngAfterViewInit() {
        this.paginatorDocentes.page
            .pipe(
                tap((paginator) => {
                    this.eventPaginator.emit(paginator);
                })
            )
            .subscribe();
    }

    handleAperturarPrePublicar = () => {
        let fechaActual = new Date();
        console.log(
            "Booleano aperturar plazas fecha:",
            fechaActual > this.fechaFinNacional
        );
        if (fechaActual > this.fechaFinNacional) {
            return this.dataService
                .Message()
                .msgAutoCloseWarningNoButton(
                    '"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE FINALLIZÓ LA ACTIVIDAD PRE PUBLICACIÓN DE PLAZAS."',
                    3000,
                    () => {}
                ); // M152
        }
        console.log("Booleano nro etapas inciadasl:", this.nroEtapasIniciadas);
        if (this.nroEtapasIniciadas > 0) {
            return this.dataService
                .Message()
                .msgAutoCloseWarningNoButton(
                    '"NO SE PUEDE APERTURAR LA PRE PUBLICACIÓN DE PLAZAS, YA QUE EL SIGUIENTE PROCESO SE HA INICIADO"',
                    3000,
                    () => {}
                ); // M156
        }

        const request: IActualizarEtapaProcesoViewModel = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: "ADMIN",
            codigoCentroTrabajoMaestro: this.codSedeCabecera, // HARDCODE: REMOVE usar ENUM
        };

        this.dataService
            .Contrataciones()
            .getVerificarAperturarPlazasPrepublicacion(request)
            .subscribe((response) => {
                console.log("Respusta ejecucion Job PLazas: ", response);
            });

        this.dataService.Message().msgConfirm(
            "¿ESTÁ SEGURO QUE DESEA REALIZAR LA APERTURA DE LA PRE PUBLICACIÓN DE PLAZAS?",
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Contrataciones()
                    .putAperturarPlazasPrepublicacion(request)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response) => {
                        if (response > 0) {
                            this.dataService
                                .Message()
                                .msgAutoCloseSuccessNoButton(
                                    '"OPERACIÓN REALIZADA DE FORMA EXITOSA."',
                                    3000,
                                    () => {}
                                );
                            this.obtenerPlazaContratacion();
                        } else {
                            this.dataService
                                .Message()
                                .msgError(
                                    '"OCURRIERON ERRORES AL TRATAR DE APERTURAR LA PRE-PUBLICACION."',
                                    () => {}
                                );
                        }
                    });
            },
            (error) => {}
        );
    };
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

    masterToggleDocentes = () => {
        this.isAllSelectedDocentes()
            ? this.selectionDocentes.clear()
            : this.dataSourceDocentes.data.forEach((row) =>
                  this.selectionDocentes.select(row)
              );

        // added
        this.isAllSelectionDocentes = !this.isAllSelectionDocentes;
    };

    handlePrePublicar = () => {
        /*
        var request: IGenerarPdfPlazasPrePublicadas = {
            idEtapaProceso: this.idEtapaProceso,
            maestroProceso: 'CONTRATACIÓN DOCENTE',
            anio: this.fecha.getFullYear(),
            instancia: 'MINEDU',
            usuarioCreacion: 'ADMIN'
        };

        const confirmationMessage = "<strong>¿ESTÁ SEGURO QUE DESEA REALIZAR LA PRE PUBLICACIÓN DE LAS PLAZAS?</strong><br>Al pre publicar las plazas no se podrá determinar plazas para Becarios y también se generará el listado de las plazas en formato PDF."; // M108
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
                        this.handleFinalizarEtapaDespuesDePrePublicar() // agregado segun obs de ecu
                        // msgSuccess
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000, () => {});
                        this.obtenerEstadoDesarrolloEtapa();
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON ERRORES AL PRE PUBLICAR LAS PLAZAS."', () => {});
                    }
                });
            }, (error) => {}
        ); 
        
        */
    };
    /*
    obtenerEstadoDesarrolloEtapa = () => {
        let idProcesoEtapa = this.route.snapshot.params.id;
        let codSede = this.currentSession.codigoSede;

        this.dataService
            .Contrataciones()
            .obtenerCabeceraEstadoDesarrolloEtapaProceso(
                idProcesoEtapa,
                codSede
            )
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.estadoDesarrollo = response.estadoDesarrollo;
                }
                console.log("Estado de desarrollo : ", this.estadoDesarrollo);
            });
    }; */


    handleFinalizarEtapaDespuesDePrePublicar = () => {
        this.currentSession = this.dataService
            .Storage()
            .getInformacionUsuario();
        const request: IActualizarEtapaProcesoViewModel = {
            idEtapaProceso: this.idEtapaProceso,
            idEstadoDesarrollo: EstadoEtapaProcesoEnum.FINALIZADO,
            usuarioModificacion: "ADMIN",
            //codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
            codigoCentroTrabajoMaestro: "000000", //this.currentSession.codigoSede, // como estamos en sede MINEDU, colocamos el codigo de minedu
        };
        console.log("Fnializar Etapa: ", request);
        this.dataService
            .Contrataciones()
            .registrarPlazaContratacionSiguienteEtapaPublicacion(request)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response) => {
                if (response > 0) {
                    // msgSuccess
                } else {
                    this.dataService
                        .Message()
                        .msgError(
                            '"OCURRIERON ERRORES AL TRATAR DE FINALIZAR LA ETAPA."',
                            () => {}
                        );
                }
            });
    };
    obtenerPlazaContratacion(): void {
        let d = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.codSedeCabecera,
        };

        this.dataService
            .Contrataciones()
            .getObtenerPlazaContratacionPorIdEtapaProceso(d)
            .pipe(
                catchError((e) => of([e])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    if (response.length > 0) {
                        this.validacionPlaza =
                            response[0].estadoValidacionPlaza;
                    } else {
                        this.validacionPlaza = "PENDIENTE";
                    }
                }
            });
    }
    handleIncorporarPlazas() {
        const data = {
            idEtapaProceso: this.idEtapaProceso,
            codigoCentroTrabajoMaestro: this.codSedeCabecera,
            fragmentoUrlRetornar: "plazasprepublicadas30493",
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
                fragmentoUrlRetornar: data.fragmentoUrlRetornar,
                idRegimen: RegimenLaboralEnum.LEY_30493,
            },
        ]);
    }

    handlePlazaBecarios = () => {
        const seleccionados = this.selectionDocentes.selected || [];

        if (
            !(
                (this.isAllSelectedDocentes() &&
                    this.dataSourceDocentes.totalregistro) ||
                seleccionados.length
            )
        ) {
            this.dataService
                .Message()
                .msgWarning(
                    '"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."',
                    () => {}
                ); // M91
            return;
        }

        this.dataService.Message().msgConfirm(
            "¿ESTÁ SEGURO QUE DESEA TRASLADAR LAS PLAZAS A LA PESTAÑA “PLAZAS BECARIOS”?", // M106
            () => {
                const request: IActualizarPlazaContratacionSiEsBecarioViewModel =
                    {
                        esBecarioOrigen: false,
                        esBecarioDestino: true,
                        marcarTodos: false,
                        idEtapaProceso: this.idEtapaProceso,
                        idPlazaContratacion:
                            seleccionados[0].id_plaza_contratacion,
                        usuarioModificacion: "ADMIN",
                        plazas: seleccionados.map((s) => {
                            return {
                                idPlazaContratacionDetalle:
                                    s.id_plaza_contratacion_detalle,
                            };
                        }),
                    };

                this.dataService
                    .Contrataciones()
                    .actualizarPlazaContratacionSiEsBecario(request)
                    .pipe(
                        catchError(() => of([])),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((result: number) => {
                        if (result) {
                            //msgSuccess
                            this.dataService
                                .Message()
                                .msgAutoCloseSuccessNoButton(
                                    '"OPERACIÓN REALIZADA DE FORMA EXITOSA."',
                                    3000,
                                    () => {}
                                );
                            this.handleBuscar();
                        } else {
                            this.dataService
                                .Message()
                                .msgError(
                                    '"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE CAMBIAR EL TIPO DE PLAZA."',
                                    () => {}
                                );
                        }
                    });
            }
        );
    };
    handleBuscar = () => {
        // this.eventDelete.emit();
        // console.log("buscar emitido desde grilla");
        this.eventSearch.emit(null);
    };
    isAllSelectedDocentes = () => {
        const numSelected = this.selectionDocentes.selected.length;
        const numRows = this.dataSourceDocentes.data.length;
        return numSelected === numRows;
    };
    
    //handleVerListadoPlazas(){}
    handleVerPlazasPdf(becario: boolean) {
        this.dialogRef = this.materialDialog.open(
            ModalDocumentosPublicadosPrepublicacionComponent,
            {
                panelClass: "minedu-modal-documentos-publicados-prepublicacion",
                disableClose: true,
                data: {
                    idEtapaProceso: this.idEtapaProceso,
                    idGrupoDocumento: becario
                        ? GrupoDocumentoPublicadoEnum.PREPUBLICACIONBECARIOS
                        : GrupoDocumentoPublicadoEnum.PREPUBLICACIONDOCENTES,
                    nombreDocumento: becario
                        ? "Plazas_para_Becarios"
                        : "Plazas_Contratación_Docente",
                    esbecario: becario,
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    }
    handleExportar = () => {
        debugger;
        this.exportarPlazas()
        /*this.selectedTabIndex === 0
            ? this.exportarPlazasContratacionDocentes()
            : this.exportarPlazasBecarios();*/
    };

    private exportarPlazas = () => {
        let requestExportar: any = {
            idEtapaProceso: this.idEtapaProceso,
            esBecario: true,
            codigoCentroTrabajoMaestro : this.codSedeCabecera,
        };
        
        let idSituacionValidacion = 0;

        switch (this.indiceSeleccionado) {
            case 0:
                idSituacionValidacion = SituacionPlazasEnum.PRE_PUBLICADA;
                break;
            case 1:
                idSituacionValidacion = SituacionPlazasEnum.A_CONVOCAR;
                break;
            case 2:
                idSituacionValidacion = SituacionPlazasEnum.OBSERVADA;
                break;
            case 3:
                idSituacionValidacion = SituacionPlazasEnum.PUBLICADO;
                break;
        }
        let request = {
            idEtapaProceso: this.idEtapaProceso,
            idSituacionValidacion: idSituacionValidacion,
            codigoPlaza: null,//codigoPlaza,
            idCentroTrabajo: null,//idCentroTrabajo,
            codigoCentroTrabajo: null, //codigoCentroTrabajo,
            codigoCentroTrabajoMaestro: this.codSedeCabecera,
        };

        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(
            fechaActual.getTime() - fechaActual.getTimezoneOffset() * 60000
        )
            .toISOString()
            .split("T")[0];
        var nombreExcel = "Plazas_Contratacion";
        try {
            var nombreExportar: string =
                nombreExcel + " - " + dateString + ".xlsx"; //+(this.form.get('anio').value);
        } catch {
            var nombreExportar: string = nombreExcel + "" + ".xlsx";
        }
        // ***

        this.dataService.Spinner().show("sp6");
        this.dataService
            .Contrataciones()
            .getExportarExcelContratacionGrillaGenerica(request)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response.file, nombreExportar);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."',
                            () => {}
                        );
                }
            });
    };
    private exportarPlazasContratacionDocentes = () => {
        if (this.dataSourceDocentes.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    '"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',
                    () => {}
                );
            return;
        }

        let requestExportar: any = {
            idEtapaProceso: this.idEtapaProceso,
            esBecario: false,
            codigoCentroTrabajoMaestro : this.codSedeCabecera,
        };

        // ************************************************************************************************
        let fechaActual = new Date();
        var dateString = new Date(
            fechaActual.getTime() - fechaActual.getTimezoneOffset() * 60000
        )
            .toISOString()
            .split("T")[0];
        var nombreExcel = "Plazas_Contratacion_Docentes";
        try {
            var nombreExportar: string =
                nombreExcel + " - " + dateString + ".xlsx"; //+(this.form.get('anio').value);
        } catch {
            var nombreExportar: string = nombreExcel + ".xlsx";
        }
        // ************************************************************************************************

        this.dataService.Spinner().show("sp6");
        this.dataService
            .Contrataciones()
            .getExportarExcelContratacionEvalExp(requestExportar)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response.file, nombreExportar);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."',
                            () => {}
                        );
                }
            });
    };
    checkboxLabelDocentes(row?: any): string {
        if (!row) {
            return `${
                this.isAllSelectedDocentes() ? "deselect" : "select"
            } all`;
        }
        return `${
            this.selectionDocentes.isSelected(row) ? "deselect" : "select"
        } row ${row.position + 1}`;
    }
    handleViewInfo = (id) => {
        this.dialogRef = this.materialDialog.open(
            InformacionPlaza30328Component,
            {
                panelClass: "informacion-plaza-dialog",
                width: "1000px",
                disableClose: true,
                data: {
                    idEtapaProceso: this.idEtapaProceso,
                    idPlaza: id,
                    idRegimenLaboral: RegimenLaboralEnum.LEY_30493,
                },
            }
        );
    };
    handleEliminarPlazaIncorporada(row, i) {
          console.log("eliminando plaza incorporada A ", i, "(situacionValidacion) :",row);

        this.dataService.Message().msgConfirm(
            "¿ESTÁ SEGURO QUE DESEA ELIMINAR LA INFORMACIÓN?",
            () => {
                this.dataService.Spinner().show("sp6");
                console.log("eliminando plaza incorporada A ", i, " :", row);
                console.log(
                    "eliminando plaza c detalle :",
                    row.id_plaza_contratacion_detalle
                );
                // ****************************************************************
                let request: any = {
                    idPlazaContratacionDetalleIncorporada:
                        row.id_plaza_contratacion_detalle==undefined?row.idPlazaContratacionDetalle:row.id_plaza_contratacion_detalle,
                    codigoCentroTrabajoMaestro: this.codSedeCabecera,
                    codigoRolPassport: this.currentSession.codigoRol,
                    idEtapaProceso: this.idEtapaProceso,
                    ipCreacion: "",
                    usuarioModificacion: "ADMIN",
                    // plazas: seleccionados.map((s) => { // multiples plazas
                    //     return {
                    //         idPlazaContratacionDetalle: s.id_plaza_contratacion_detalle,
                    //     };
                    // }),
                };
                console.log("request eliminar incorporacion", request, )
                console.log("A_.", row.id_plaza_contratacion_detalle, "B:", row.idPlazaContratacionDetalle)
                this.dataService
                    .Contrataciones()
                    .eliminarPlazaIncorporada(request)
                    .pipe(
                        catchError(() => of([])),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((result: number) => {
                        if (result) {
                            this.dataService
                                .Message()
                                .msgAutoCloseSuccessNoButton(
                                    '"OPERACIÓN REALIZADA DE FORMA EXITOSA."',
                                    3000,
                                    () => {}
                                );
                            this.handleBuscar();
                        } else {
                            this.dataService
                                .Message()
                                .msgError(
                                    '"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE ELIMINAR PLAZA."',
                                    () => {}
                                );
                        }
                    });
                // ****************************************************************

                this.dataService.Spinner().hide("sp6");
            },
            (error) => {}
        );
    }
    //handlePlazaContratacionDocente = () => {
    //const seleccionados = this.selectionBecarios.selected || [];
    //
    //if (seleccionados.length) {
    //this.dataService.Message().msgWarning('"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA."', () => {});
    //return;
    //}
    //
    //this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA TRASLADAR LAS PLAZAS A LA PESTAÑA “PLAZAS CONTRATACIÓN DOCENTE”?',
    //() => {
    //const request: IActualizarPlazaContratacionSiEsBecarioViewModel =
    //{
    //esBecarioOrigen: true,
    //esBecarioDestino: false,
    //marcarTodos: false,
    //idEtapaProceso: this.idEtapaProceso,
    //idPlazaContratacion: seleccionados[0].id_plaza_contratacion,
    //usuarioModificacion: "ADMIN",
    //plazas: seleccionados.map((s) => {
    //return {
    //idPlazaContratacionDetalle: s.id_plaza_contratacion_detalle,
    //};
    //}),
    //};
    //
    //this.dataService.Contrataciones().actualizarPlazaContratacionSiEsBecario(request).pipe(
    //catchError(() => of([])),
    //finalize(() => {
    //this.dataService.Spinner().hide("sp6");
    //})
    //)
    //.subscribe((result: number) => {
    //if (result) {
    //// msgAutoSuccess // (sin boton) - mensaje en la parte superior derecha
    //this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {
    //});
    //this.handleBuscar();
    //} else {
    //this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE CAMBIAR EL TIPO DE PLAZA."',() => {});
    //}
    //});
    //}
    //);
    //}

    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
    };

    handlePlazasObservar(){
        if (this.selectionDocentes.selected.length === 0) {
            this.dataService.Message().msgWarning('Debe seleccionar como mínimo un registro de la grilla.', () => { });
            return;        
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA OBSERVAR LAS PLAZAS?',
            () => {
                this.handleObservarPlazasModal(this.selectionDocentes.selected);
            }
        );
    }
    
    handleObservarPlazasModal(seleccionados: any[]): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        // console.log(this.currentSession)
        this.dialogRef = this.materialDialog.open(ModalPlazaObservadaEvalExpComponent, {
            panelClass: "modal-plaza-observada-eval-exp-dialog",
            width: "980px",
            disableClose: true,
            data: {
                idEtapaProceso: this.idEtapaProceso,
                numeroDocumento: this.currentSession.numeroDocumento,
                plazasObservadas: seleccionados,
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (response) {
                //this.selectionPlazasConvocar.clear();
                this.handleBuscar();
            }
        });
    }


    handlePlazasConvocar(){
        if (this.selectionDocentes.selected.length === 0) {
            this.dataService.Message().msgWarning('Debe seleccionar como mínimo un registro de la grilla.', () => { });
            return;
        }
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA CONVOCAR LAS PLAZAS?',
            () => {
                this.handleConvocarPlazas(this.selectionDocentes);
            }
        );
    }

    handleConvocarPlazas(selection: any): void {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            usuarioModificacion: this.currentSession.numeroDocumento,
            plazas: selection.selected,
            codigoCentroTrabajoMaestro : this.codSedeCabecera,
            isSeleccionadoTodosDesiertas:this.isAllSelectionDocentes
        };
        this.dataService.Contrataciones().putEvalExpConvocar(request).pipe(
            catchError((e) => of(e)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        ).subscribe(response => {
            if (response > 0) {
                this.dataService.Message().msgInfo(MensajesSolicitud.M07, () => { });
                // this.selectionPlazasDesiertas.clear();
                // this.selectionPlazasObservadas.clear();
                this.handleBuscar();
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
            }
        });
    }
    
    handleMigrarPlazasDesiertas() {
        this.dataService.Message().msgConfirm('"¿ESTÁ SEGURO QUE DESEA MIGRAR PLAZAS DESIERTAS?"', () => {
            const request = {
                idEtapaProceso: this.idEtapaProceso,
                codigoCentroTrabajoMaestro: this.codSedeCabecera,                
                usuariplazaBotonesGrillaActivosFinaloCreacion:'ADMIN'
            };
            console.log("Datos a enviar request", request);
            // this.loading = true;
            this.dataService.Spinner().show("sp6");
            this.dataService.Contrataciones().migratePlazaContrataciones(request).pipe(catchError((error) => {
                this.dataService.Message().msgWarning(error.error.messages[0]);
                return of(null);
            }), finalize(() => {
                this.dataService.Spinner().hide("sp6");
                // this.loading = false;
            })).subscribe((result: any) => {
                if (result !== null) {
                    if (result === true) {
                        this.dataService.Message().msgInfo('"'+ "SUCCESSFULL"+'"', () => { });
                        // this.onChangeMigrarPlazaContratacion.emit(true);
                        this.handleBuscar();
                    } else {
                        this.dataService.Message().msgError('"'+"ERROR AL EJECUTAR OPERACION"+'"', () => { });
                    }
                }
            });
        }, () => { });
    }
}

interface ControlesActivos {
    btnFinalizarEtapa: boolean;
    btnAperturaEtapa: boolean;
    btnIncorporarPlazas: boolean;
    btnPrePublicarPlazas: boolean;
    btnPlazaBecarios: boolean;
    btnVerPlazasPDF: boolean;
    btnExportar: boolean;
}
