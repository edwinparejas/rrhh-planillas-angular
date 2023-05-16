import { CollectionViewer, SelectionModel } from "@angular/cdk/collections";
import { DataSource } from "@angular/cdk/table";
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import { validateBasis } from "@angular/flex-layout";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "app/core/data/data.service";
import { CentroTrabajoModel } from "app/core/model/centro-trabajo.model";
import { SecurityModel } from "app/core/model/security/security.model";
import { TipoOperacionEnum } from "app/core/model/types";
import { SharedService } from "app/core/shared/shared.service";
import {
    AdjudicacionModel,
    EtapaResponseModel,
    OpcionFiltro,
    ResumenAdjudicacionesResponse,
} from "app/main/apps/procesos/contratacion/models/contratacion.model";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { BuscadorServidorPublicoComponent } from "../../components/buscador-servidor-publico/buscador-servidor-publico.component";
import { BusquedaPlazaComponent } from "../../components/busqueda-plaza/busqueda-plaza.component";
import {
    RegimenLaboralEnum,
    TipoFormatoPlazaEnum,
    EstadoAdjudicacionEnum,
    TipoDocumentoIdentidadEnum,
} from "../../_utils/constants";
//import { AdjudicacionSegundaFaseComponent } from '../adjudicacion-segunda-fase/adjudicacion-segunda-fase.component';
import { DetalleObservacionComponent } from "../components/detalle-observacion/detalle-observacion.component";
import { RegistrarMotivoComponent } from "../components/registrar-motivo/registrar-motivo.component";
import {
    TablaPermisos,
    ResultadoOperacionEnum,
} from "../../../../../../core/model/types";
import { saveAs } from "file-saver";
import { InformacionAdjudicacionComponent } from "../components/informacion-adjudicacion/informacion-adjudicacion.component";

@Component({
    selector: "minedu-bandeja-adjudicacion",
    templateUrl: "./bandeja-adjudicacion.component.html",
    styleUrls: ["./bandeja-adjudicacion.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaAdjudicacionComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    maxLengthnumeroDocumentoIdentidad: number;
    form: FormGroup;
    dialogRef: any;
    idServidorPublicoSelected: number;
    etapaResponse: EtapaResponseModel;
    resumenAdjudicacionesResponse: ResumenAdjudicacionesResponse;
    idEtapa: number;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    dataSource: AdjudicacionDataSource | null;
    selection = new SelectionModel<any>(true, []);
    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    estadoAdjudicacion = EstadoAdjudicacionEnum;
    comboLists = {
        listTipoDocumento: [],
        listInstancia: [],
        listSubInstancia: [],
        listGrupoInscripcion: [],
        listModalidadEducativa: [],
        listNivelEducativo: [],
        listAreaCurricular: [],
        listEstadoAdjudicacion: [],
    };
    adjudicacion: AdjudicacionModel = new AdjudicacionModel();
    regimenLaboral = RegimenLaboralEnum;
    displayedColumns: string[] = [
        "registro",
        "idInstancia",
        "idSubInstancia",
        "descripcionGrupoInscripcion",
        "ordenMerito",
        "nuemeroDocumentoIdentidad",
        "nombreCompleto",
        "puntajeTotal",
        "puntajeDesempate",
        "codigoPlaza",
        "centroTrabajo",
        "cargo",
        "descripcionEstadoAdjudicacion",
        "acciones",
    ];

    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
    };
    currentSession: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;
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
    export = false;
    request = {
        idProceso: null,
        idEtapa: null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        codigoPlaza: null,
        idModalidadEducativa: null,
        idNivelEducativo: null,
        idAreaCurricular: null,
        idInstancia: null,
        idSubInstancia: null,
        idEstadoAdjudicacion: null,
    };
    /*     @ViewChild(AdjudicacionSegundaFaseComponent) private adjudicacionSegundaFaseComponent: AdjudicacionSegundaFaseComponent;
        @ViewChild(AdjudicacionSegundaFaseComponent) private AdjudicacionPrimeraFaseComponent: AdjudicacionSegundaFaseComponent; */

    constructor(
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private route: ActivatedRoute,
        private router: Router,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) {}

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.handleResponsive();
        this.idEtapa = this.route.snapshot.params.id;
        this.buildForm();
        this.buildSeguridad();
        this.obtenerEtapa();
        this.loadTipodocumento();
        this.loadInstancia();
        this.loadModalidadEducativa();
        this.loadAreaCurricular();
        this.loadEstadosAdjudicacion();
        this.loadGrupoInscripcion();
        this.dataSource = new AdjudicacionDataSource(this.dataService);
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
        this.resetForm();
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Adjudicación");
        this.sharedService.setSharedTitle("Desarrollo de Contratación");
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
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
            idTipoDocumentoIdentidad: this.form.get("idTipoDocumentoIdentidad")
                .value,
            numeroDocumentoIdentidad: this.form.get("numeroDocumentoIdentidad")
                .value,
            codigoPlaza: this.form.get("codigoPlaza").value,
            idModalidadEducativa: this.form.get("idModalidadEducativa").value,
            idNivelEducativo: this.form.get("idNivelEducativo").value,
            idAreaCurricular: this.form.get("idAreaCurricular").value,
            idInstancia: this.form.get("idInstancia").value,
            idSubInstancia: this.form.get("idSubInstancia").value,
            idEstadoAdjudicacion: this.form.get("idEstadoAdjudicacion").value,
        };
    };

    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            codigoPlaza: [null],
            idInstancia: [null],
            idSubInstancia: [null],
            idGrupoInscripcion: [null],
            idModalidadEducativa: [null],
            idNivelEducativo: [null],
            idAreaCurricular: [null],
            idEstadoAdjudicacion: [null],
        });
    };

    buscarPlaza = () => {};
    buscarPlazaPersonalizada = () => {};
    handleLimpiar(): void {
        this.resetForm();
    }

    resetForm = () => {
        this.form.reset();
        this.form
            .get("idTipoDocumentoIdentidad")
            .setValue(this.opcionFiltro.item.value);
        this.form.get("idInstancia").setValue(this.opcionFiltro.item.value);
        this.form.get("idSubInstancia").setValue(this.opcionFiltro.item.value);
        this.form
            .get("idModalidadEducativa")
            .setValue(this.opcionFiltro.item.value);
        this.form
            .get("idNivelEducativo")
            .setValue(this.opcionFiltro.item.value);
        this.form
            .get("idAreaCurricular")
            .setValue(this.opcionFiltro.item.value);
        this.form
            .get("idEstadoAdjudicacion")
            .setValue(this.opcionFiltro.item.value);
        this.form
            .get("idGrupoInscripcion")
            .setValue(this.opcionFiltro.item.value);
    };

    handleBuscar = () => {
        this.setRequest();
        if (
            this.request.idTipoDocumentoIdentidad == -1 &&
            this.request.numeroDocumentoIdentidad != null
        ) {
            this.dataService
                .Message()
                .msgWarning("Debe ingresar Tipo de documento.", () => {});
            return;
        }

        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
        this.obtenerResumenAdjudicacion(
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
                    "No se encontró información para exportar.",
                    () => {}
                );
            return;
        }

        this.export = true;
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Contrataciones()
            .exportarExcelAdjudicacion(
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
                    saveAs(response, "Adjudicacion.xlsx");
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            "No se encontró información para los criterios de búsqueda ingresado",
                            () => {}
                        );
                }
            });
    };

    handleFinalizarEtapa = () => {
        const request = {
            idEtapa: this.etapaResponse.idEtapa,
            usuarioRegistro: this.currentSession.numeroDocumento,
        };

        const resultMessage = "Operación realizada de forma exitosa.";
        this.dataService.Message().msgConfirm(
            "¿Está seguro de que desea finalizar la etapa?",
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Contrataciones()
                    .finalizarEtapa(request)
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
                            this.handleRetornar();
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
                                    "Ocurrieron algunos problemas al envíar consolizado plaza.",
                                    () => {}
                                );
                        }
                    });
            },
            (error) => {}
        );
    };

    handlePublicarAdjudicados = () => {
        const request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            usuarioRegistro: this.currentSession.numeroDocumento,
        };

        let message =
            "<strong>¿Desea publicar el listado de adjudicados?</strong><br>";
        message =
            message +
            "Al publicar el listado de adjudicados no podrá agregar modificar y/o eliminar adjudicados de este proceso posteriormente.";
        const resultMessage = "Operación realizada de forma exitosa.";
        this.dataService.Message().msgConfirm(
            message,
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Contrataciones()
                    .publicarAdjudicaciones(request)
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
                            this.handleRetornar();
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
                                    "Ocurrieron algunos problemas al envíar consolizado plaza.",
                                    () => {}
                                );
                        }
                    });
            },
            (error) => {}
        );
    };

    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
    };

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
                    this.handleBuscar();
                }
            });
    };

    busquedaPlazaPersonalizada(): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "980px",
            disableClose: true,
            data: {
                action: "busqueda",
                tipoFormato: TipoFormatoPlazaEnum.GENERAL,
                codigoCentroTrabajoMaestro: this.currentSession.codigoSede
            },
        });

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const plaza = resp.plazaSelected;
                this.form.get("codigoPlaza").setValue(plaza.codigoPlaza.trim());
            }
        });
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
                    .get("idTipoDocumentoIdentidad")
                    .setValue(servidorPublico.idTipoDocumentoIdentidad);
                this.form
                    .get("numeroDocumentoIdentidad")
                    .setValue(servidorPublico.numeroDocumentoIdentidad);
            }
        });
    }

    buscarServidorPublico(): void {
        if (!this.form.valid) {
            this.dataService
                .Message()
                .msgWarning(
                    "Debe ingresar por lo menos un criterio de búsqueda",
                    () => {}
                );
            return;
        }

        const idTipoDocumentoIdentidad = this.form.get(
            "idTipoDocumentoIdentidad"
        ).value;
        const numeroDocumentoIdentidad = this.form.get(
            "numeroDocumentoIdentidad"
        ).value;
        if (
            numeroDocumentoIdentidad.length === 0 ||
            numeroDocumentoIdentidad.length < 8
        ) {
            return;
        }

        const request = {
            //idDre: this.idDre,
            //idUgel: this.idUgel,
            idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad: numeroDocumentoIdentidad,
            primerApellido: "",
            segundoApellido: "",
            nombres: "",
        };

        const paginaActual = 1;
        const tamanioPagina = 10;

        this.dataService
            .Contrataciones()
            .getListaServidorPublico(request, paginaActual, tamanioPagina)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const servidorPublico = response.data[0];
                    if (
                        servidorPublico === null ||
                        servidorPublico === undefined
                    ) {
                        // EX02: M47
                        this.dataService
                            .Message()
                            .msgWarning(
                                "Servidor público no se encuentra registrado",
                                () => {}
                            );
                    } else {
                        /*      this.idServidorPublicoSelected =
                                 servidorPublico.idServidorPublico;
                             this.obtenerDatosServidorPublico(
                                 this.idServidorPublicoSelected
                             ); */
                    }
                }
            });
    }

    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = true;
        this.currentSession = this.dataService
            .Storage()
            .getInformacionUsuario();
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

    loadModalidadEducativa = () => {
        this.dataService
            .Contrataciones()
            .getComboModalidadEducativa()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idModalidadEducativa,
                        label: `${x.descripcionModalidadEducativa}`,
                    }));
                    this.comboLists.listModalidadEducativa = data;
                    this.comboLists.listModalidadEducativa.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                    this.comboLists.listNivelEducativo.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadNivelEducativa = (idModalidadEducativa) => {
        if (idModalidadEducativa == null || idModalidadEducativa == -1) {
            this.comboLists.listNivelEducativo = [];
            this.comboLists.listNivelEducativo.unshift({
                value: this.opcionFiltro.item.value,
                label: this.opcionFiltro.item.label,
            });

            return;
        } else {
            this.dataService
                .Contrataciones()
                .getComboNivelEducativa(idModalidadEducativa)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {})
                )
                .subscribe((response: any) => {
                    if (response && response.result) {
                        const data = response.data.map((x) => ({
                            ...x,
                            value: x.idNivelEducativo,
                            label: `${x.descripcionNivelEducativo}`,
                        }));
                        this.comboLists.listNivelEducativo = data;
                        this.comboLists.listNivelEducativo.unshift({
                            value: this.opcionFiltro.item.value,
                            label: this.opcionFiltro.item.label,
                        });
                        this.form
                            .get("idNivelEducativo")
                            .setValue(this.opcionFiltro.item.value);
                    }
                });
        }
    };

    loadAreaCurricular = () => {
        this.dataService
            .Contrataciones()
            .getComboAreacurricular()
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idAreaCurricular,
                        label: `${x.descripcionAreaCurricular}`,
                    }));
                    this.comboLists.listAreaCurricular = data;
                    this.comboLists.listAreaCurricular.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadEstadosAdjudicacion = () => {
        this.dataService
            .Contrataciones()
            .getComboEstadosAdjudicacion()
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
                    this.comboLists.listEstadoAdjudicacion = data;
                    this.comboLists.listEstadoAdjudicacion.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadGrupoInscripcion = () => {
        this.dataService
            .Contrataciones()
            .getComboGruposInscripcion()
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

    handleRegistrarMotivo = (row) => {
        this.dialogRef = this.materialDialog.open(RegistrarMotivoComponent, {
            panelClass: "minedu-registrar-motivo",
            width: "700px",
            disableClose: true,
            data: {
                action: "registrar",
                idOperacion: TipoOperacionEnum.Registrar,
                idAdjudicacion: row.idAdjudicacion,
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

    handleDetalleObservacion = (row) => {
        console.log("data", row);

        this.dialogRef = this.materialDialog.open(DetalleObservacionComponent, {
            panelClass: "minedu-detalle-observacion",
            width: "700px",
            disableClose: true,
            data: {
                idAdjudicacion: row.idAdjudicacion,
                AdjuncacionRow: row,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {});
    };

    handleInformacion = (row) => {
        console.log("data", row);

        this.dialogRef = this.materialDialog.open(
            InformacionAdjudicacionComponent,
            {
                panelClass: "informacion-adjudicacion-dialog",
                width: "1080px",
                disableClose: true,
                data: {
                    idAdjudicacion: row.idAdjudicacion,
                    AdjuncacionRow: row,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {});
    };

    handleGoAdjudicarPlaza = (row) => {
        this.router.navigate(
            [
                "../../adjudicarplaza/" +
                    row.idCalificacion +
                    "/" +
                    row.idAdjudicacion,
            ],
            { relativeTo: this.route }
        );
    };

    obtenerResumenAdjudicacion = (data: any, pageIndex, pageSize) => {
        this.dataService
            .Contrataciones()
            .getListaResumenAdjudicacion(data, pageIndex, pageSize)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.resumenAdjudicacionesResponse = response.data;
                }
            });
    };

    handleCargaMasiva = () => {};

    handleEliminarMasivo = () => {};

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

export class AdjudicacionDataSource extends DataSource<any> {
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
                .getListaAdjudicacion(data, pageIndex, pageSize)
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
                                "No se encontró información de la(s) adjudicación(s) para los criterios de búsqueda ingresados.",
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
