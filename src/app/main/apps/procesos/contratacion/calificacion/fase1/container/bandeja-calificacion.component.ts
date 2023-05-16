import {
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    OnDestroy,
    AfterViewInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/core/data/data.service";
import {
    ContratacionModel,
    EtapaResponseModel,
    OpcionFiltro,
} from "app/main/apps/procesos/contratacion/models/contratacion.model";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { mineduAnimations } from "../../../../../../../../@minedu/animations/animations";
import { SharedService } from "../../../../../../../core/shared/shared.service";
import { MatPaginator } from "@angular/material/paginator";
import { DataSource } from "@angular/cdk/table";
import { CollectionViewer, SelectionModel } from "@angular/cdk/collections";
import { BuscadorServidorPublicoComponent } from "../../../components/buscador-servidor-publico/buscador-servidor-publico.component";
import { MatDialog } from "@angular/material/dialog";
import { RegistrarCalificacionComponent } from "../../components/registrar-calificacion/registrar-calificacion.component";
import { TipoOperacionEnum } from "app/core/model/types";
import {
    TablaConfiguracionSistema,
    ResultadoOperacionEnum,
} from "../../../../../../../core/model/types";
import Swal from "sweetalert2";
import { InformacionCalificacionComponent } from "../../components/informacion-calificacion/informacion-calificacion.component";
import {
    EstadoCalificacionEnum,
    RegimenLaboralEnum,
    EtapaFaseEnum,
    TipoDocumentoIdentidadEnum,
} from "../../../_utils/constants";
import { SecurityModel } from "../../../../../../../core/model/security/security.model";
import { saveAs } from "file-saver";
import { RegistrarReclamoComponent } from "../../components/registrar-reclamo/registrar-reclamo.component";

@Component({
    selector: "minedu-bandeja-calificacion",
    templateUrl: "./bandeja-calificacion.component.html",
    styleUrls: ["./bandeja-calificacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaCalificacionComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    maxLengthnumeroDocumentoIdentidad: number;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    dataSource: CalificacionDataSource | null;
    selection = new SelectionModel<any>(true, []);
    etapaResponse: EtapaResponseModel;
    regimenLaboral = RegimenLaboralEnum;
    etapaFase = EtapaFaseEnum;
    currentSession: SecurityModel = new SecurityModel();
    idEtapa: number;
    form: FormGroup;
    export = false;
    comboLists = {
        listTipoDocumento: [],
        listInstancia: [],
        listSubInstancia: [],
        listEstadoCalificacion: [],
        listGrupoInscripcion: [],
    };

    calificacion: ContratacionModel = new ContratacionModel();
    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    dialogRef: any;
    idServidorPublicoSelected: number;
    datos = {
        idRequerimiento: null,
    };
    estadoCalificacion = EstadoCalificacionEnum;

    displayedColumns: string[] = [
        "registro",
        "descripcionInstancia",
        "descripcionSubinstancia",
        "descripcionGrupoInscripcion",
        "numeroOrden",
        "numeroDocumentoIdentidad",
        "nombreCompleto",
        "descripcionEstado",
        "puntajeTotal",
        "puntajeDesempate",
        "acciones",
    ];

    isMobile = false;
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    request = {
        idEtapa: null,
        idProceso: null,
        numeroDocumentoIdentidad: null,
        idTipoDocumentoIdentidad: null,
        idInstancia: null,
        idSubInstancia: null,
        idGrupoInscripcion: null,
        idEstadoCalificacion: null,
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog
    ) {}

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.idEtapa = this.route.snapshot.params.id;
        this.buildForm();
        this.buildSeguridad();
        this.loadTipodocumento();
        this.loadInstancia();
        this.loadEstadosCalificacion();
        this.loadGrupoInscripcion();
        this.dataSource = new CalificacionDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Registros por página";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
        this.obtenerEtapa();
        this.handleResponsive();
        this.handleLimpiar();
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );
    }

    ngOnDestroy(): void {}

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            numeroDocumentoIdentidad: [null],
            idTipoDocumentoIdentidad: [null],
            idOrigenRegistro: [null],
            idInstancia: [null],
            idSubInstancia: [null],
            idGrupoInscripcion: [null],
            idEstadoCalificacion: [null],
        });
    };

    loadData(pageIndex, pageSize): void {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    setRequest = () => {
        this.request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            numeroDocumentoIdentidad: this.form.get("numeroDocumentoIdentidad")
                .value,
            idTipoDocumentoIdentidad: this.form.get("idTipoDocumentoIdentidad")
                .value,
            idInstancia: this.form.get("idInstancia").value,
            idSubInstancia: this.form.get("idSubInstancia").value,
            idGrupoInscripcion: this.form.get("idGrupoInscripcion").value,
            idEstadoCalificacion: this.form.get("idEstadoCalificacion").value,
        };
    };

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Calificaciones");
        this.sharedService.setSharedTitle("Desarrollo de Contratación");
    }

    obtenerEtapa = () => {
        this.dataService
            .Contrataciones()
            .obtenerCabeceraEtapaProcesoById(this.idEtapa)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.etapaResponse = response.data;
                    console.log("this.etapaResponse", this.etapaResponse);
                    this.handleBuscar();
                }
            });
    };

    loadTipodocumento = () => {
        this.dataService
            .Contrataciones()
            .getComboTipodocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTipoDocumento = data;
                    this.comboLists.listTipoDocumento.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadInstancia = () => {
        this.dataService
            .Contrataciones()
            .getComboInstancia()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.id,
                        label: `${x.descripcionInstancia}`,
                    }));
                    this.comboLists.listInstancia = data;
                    this.comboLists.listInstancia.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                    this.comboLists.listSubInstancia.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadSubInstancia = (idInstancia) => {
        if (idInstancia == null || idInstancia == -1) {
            this.comboLists.listSubInstancia = [];
            this.comboLists.listSubInstancia.unshift({
                value: this.opcionFiltro.item.value,
                label: this.opcionFiltro.item.label,
            });

            return;
        } else {
            this.dataService
                .Contrataciones()
                .getComboSubinstancia(idInstancia)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {})
                )
                .subscribe((response: any) => {
                    if (response && response.result) {
                        const data = response.data.map((x) => ({
                            ...x,
                            value: x.id,
                            label: `${x.descripcionSubinstancia}`,
                        }));
                        this.comboLists.listSubInstancia = data;
                        this.comboLists.listSubInstancia.unshift({
                            value: this.opcionFiltro.item.value,
                            label: this.opcionFiltro.item.label,
                        });
                        this.form
                            .get("idSubInstancia")
                            .setValue(this.opcionFiltro.item.value);
                    }
                });
        }
    };

    loadEstadosCalificacion = () => {
        this.dataService
            .Contrataciones()
            .getComboEstadosCalificacion()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listEstadoCalificacion = data;
                    this.comboLists.listEstadoCalificacion.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadGrupoInscripcion = () => {
        this.dataService
            .Contrataciones()
            .getComboGrupoInscripcion()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idGrupoInscripcion,
                        label: `${x.descripcionGrupoInscripcion}`,
                    }));
                    this.comboLists.listGrupoInscripcion = data;
                    this.comboLists.listGrupoInscripcion.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    buildSeguridad = () => {
        this.currentSession = this.dataService
            .Storage()
            .getInformacionUsuario();
    };

    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
    };

    handleLimpiar = () => {
        this.form.reset();
        //  this.form.get('anio').setValue(new Date());
        this.form
            .get("idTipoDocumentoIdentidad")
            .setValue(this.opcionFiltro.item.value);
        this.form
            .get("idOrigenRegistro")
            .setValue(this.opcionFiltro.item.value);
        this.form.get("idInstancia").setValue(this.opcionFiltro.item.value);
        this.form.get("idSubInstancia").setValue(this.opcionFiltro.item.value);
        this.form
            .get("idGrupoInscripcion")
            .setValue(this.opcionFiltro.item.value);
        this.form
            .get("idEstadoCalificacion")
            .setValue(this.opcionFiltro.item.value);
    };

    handleBuscar = () => {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    };

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    "No se encontró información para para exportar.",
                    () => {}
                );
            return;
        }

        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Contrataciones()
            .exportarExcelCalificacion(
                this.request,
                1,
                this.dataSource.dataTotal
            )
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this.export = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    saveAs(response, "calificaciones.xlsx");
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            "No se encontró información para los criterios de búsqueda ingresados.",
                            () => {}
                        );
                }
            });
    };

    handleRegistrar = (row) => {
        this.dialogRef = this.materialDialog.open(
            RegistrarCalificacionComponent,
            {
                panelClass: "registra-calificacion-dialog",
                width: "1080px",
                disableClose: true,
                data: {
                    action: "registrar",
                    idOperacion: TipoOperacionEnum.Registrar,
                    etapaResponse: this.etapaResponse,
                    idEtapa: this.idEtapa,
                    calificacionesRow: row,
                    currentSession: this.currentSession,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado === true) {
                this.handleBuscar();
            }
        });
    };

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
                    .get("idTipoDocumentoIdentidad")
                    .setValue(servidorPublico.idTipoDocumentoIdentidad);
                this.form
                    .get("numeroDocumentoIdentidad")
                    .setValue(servidorPublico.numeroDocumentoIdentidad);
            }
        });
    }

    handleCargaMasiva = () => {
        if (0 == 0) {
            // this.totalCalificacionesProcesoEtapa TODO
            this.datos.idRequerimiento = 0;
            console.log("this.route", this.route);
            const param = this.routeGenerator(this.datos);
            this.router.navigate([param, "cargamasiva"], {
                relativeTo: this.route,
            });
        } else {
            this.dataService
                .Message()
                .msgWarning(
                    "No se puede cargar calificaciones. Ya existen calificaciones para el proceso y etapa ",
                    () => {}
                );
        }
    };

    handleEliminarMasivo = () => {
        let message =
            "<strong>¿Eliminar todos los registros cargados de forma masiva?</strong><br>";
        message =
            message +
            " Al eliminar todos los registros cargados de forma masiva no podran recuperarse";
        Swal.fire({
            title: "",
            html: message,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d84d2a",
            cancelButtonColor: "#333333",
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.value) {
                this.eliminarCalificaciones();
            }
        });
    };

    eliminarCalificaciones() {
        var data = {
            idProceso: Number(this.etapaResponse.idProceso),
            idEtapa: Number(this.etapaResponse.idEtapa),
            usuarioRegistro: this.currentSession.numeroDocumento,
        };

        let message = "Eliminado";
        message = message + "Se eliminó satisfactoriamente.";
        this.dataService.Spinner().show("sp6"); //  TODO
        this.dataService
            .Contrataciones()
            .eliminarMasivo(data)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.dataService
                        .Message()
                        .msgSuccess("Se eliminó satisfactoriamente.", () => {});
                    this.handleBuscar();
                    // this.geTotalCalificaciones();
                } else if (
                    response &&
                    response.statusCode === ResultadoOperacionEnum.NotFound
                ) {
                    this.dataService
                        .Message()
                        .msgWarning(response.messages[0], () => {});
                } else if (
                    response &&
                    response.statusCode ===
                        ResultadoOperacionEnum.UnprocessableEntity
                ) {
                    this.dataService
                        .Message()
                        .msgWarning(response.messages[0], () => {});
                } else {
                    this.dataService
                        .Message()
                        .msgError(
                            "Ocurrieron algunos problemas al guardar la información.",
                            () => {}
                        );
                }
            });
    }

    private routeGenerator = (data: any): string => {
        let formatoFiltrar = 0;
        let codigoFuncionalidad = 9;
        let codigoSistema = 4;
        const param =
            (codigoSistema + "").padStart(3, "0") +
            (codigoFuncionalidad + "").padStart(4, "0") +
            String(this.etapaResponse.codigoProceso).padStart(10, "0") +
            String(this.etapaResponse.codigoEtapa).padStart(10, "0") +
            String(formatoFiltrar).padStart(10, "0");

        return param;
    };

    handleDetalle = (row) => {
        this.dialogRef = this.materialDialog.open(
            InformacionCalificacionComponent,
            {
                panelClass: "informacion-calificacion-dialog",
                width: "1080px",
                disableClose: true,
                data: {
                    action: "registrar",
                    etapaResponse: this.etapaResponse,
                    idEtapa: this.idEtapa,
                    calificacionesRow: row,
                    currentSession: this.currentSession,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado === true) {
                this.handleBuscar();
            }
        });
    };

    handleRegistrarReclamo = (row) => {
        this.dialogRef = this.materialDialog.open(RegistrarReclamoComponent, {
            panelClass: "minedu-registrar-reclamo",
            width: "700px",
            disableClose: true,
            data: {
                action: "registrar",
                idOperacion: TipoOperacionEnum.Registrar,
                idCalificacion: row.idCalificacion,
                calificacion: row,
                currentSession: this.currentSession,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado === true) {
                this.handleBuscar();
            }
        });
    };

    handleCafilicarAutomatica = () => {
        const request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            usuarioRegistro: this.currentSession.numeroDocumento,
        };

        const resultMessage = "Operación realizada de forma exitosa.";
        this.dataService.Message().msgConfirm(
            "¿Está seguro de que desea calificar automáticamente?",
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Contrataciones()
                    .calificarAutomatica(request)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response) => {
                        if (response && response.result) {
                            this.dataService
                                .Message()
                                .msgInfo(resultMessage, () => {});
                            this.handleBuscar();
                        } else if (
                            response &&
                            response.statusCode ===
                                ResultadoOperacionEnum.NotFound
                        ) {
                            this.dataService
                                .Message()
                                .msgWarning(response.messages[0], () => {});
                        } else if (
                            response &&
                            response.statusCode ===
                                ResultadoOperacionEnum.UnprocessableEntity
                        ) {
                            this.dataService
                                .Message()
                                .msgWarning(response.messages[0], () => {});
                        } else {
                            this.dataService
                                .Message()
                                .msgError(
                                    "Ocurrieron algunos problemas al calcular automáticamente.",
                                    () => {}
                                );
                        }
                    });
            },
            (error) => {}
        );
    };

    handlePublicarCalificacion = () => {
        const request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            usuarioRegistro: this.currentSession.numeroDocumento,
        };

        const resultMessage = "Operación realizada de forma exitosa.";
        this.dataService.Message().msgConfirm(
            "¿Está seguro de que desea publicar la lista?",
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Contrataciones()
                    .publicarCalificacion(request)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                        })
                    )
                    .subscribe((response) => {
                        if (response && response.result) {
                            this.dataService
                                .Message()
                                .msgInfo(resultMessage, () => {});
                            this.handleBuscar();
                        } else if (
                            response &&
                            response.statusCode ===
                                ResultadoOperacionEnum.NotFound
                        ) {
                            this.dataService
                                .Message()
                                .msgWarning(response.messages[0], () => {});
                        } else if (
                            response &&
                            response.statusCode ===
                                ResultadoOperacionEnum.UnprocessableEntity
                        ) {
                            this.dataService
                                .Message()
                                .msgWarning(response.messages[0], () => {});
                        } else {
                            this.dataService
                                .Message()
                                .msgError(
                                    "Ocurrieron algunos problemas al publicar calificaciones.",
                                    () => {}
                                );
                        }
                    });
            },
            (error) => {}
        );
    };

    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get("numeroDocumentoIdentidad").setValue("");
        this.maxLengthnumeroDocumentoIdentidad =
            tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;

        this.form
            .get("numeroDocumentoIdentidad")
            .setValidators([
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),
            ]);
    }

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    };
}

export class CalificacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);

        if (data.anio === null && data.idServidorPublico === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Contrataciones()
                .getListaCalificacion(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => this._loadingChange.next(false))
                )
                .subscribe((response: any) => {
                    this._dataChange.next(response.data || []);
                    this.totalregistro =
                        (response.data || []).length === 0
                            ? 0
                            : response.data[0].totalRegistro;
                    if ((response.data || []).length === 0) {
                        this.dataService
                            .Message()
                            .msgWarning(
                                "No se encontró información de lo(s) postulante(s) para los criterios de búsqueda ingresados.",
                                () => {}
                            );
                    }
                });
        }
        /* this._dataChange.next(data);
        this.totalregistro = 0; */
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
