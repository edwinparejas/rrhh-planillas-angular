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
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { DataService } from "app/core/data/data.service";
import {
    ContratacionModel,
    OpcionFiltro,
} from "app/main/apps/procesos/contratacion/models/contratacion.model";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { mineduAnimations } from "../../../../../../../@minedu/animations/animations";
import { RegistraPostulanteComponent } from "../components/registra-postulante/registra-postulante.component";
import { ActivatedRoute, Router } from "@angular/router";
import { EtapaResponseModel } from "../../models/contratacion.model";
import { BuscadorServidorPublicoComponent } from "../../components/buscador-servidor-publico/buscador-servidor-publico.component";
import { TablaPermisos, TipoOperacionEnum } from "app/core/model/types";
import { saveAs } from "file-saver";
import { InformacionPostulanteComponent } from "../components/informacion-postulante/informacion-postulante.component";
import { SecurityModel } from "app/core/model/security/security.model";
import { CentroTrabajoModel } from "app/core/model/centro-trabajo.model";
import { SharedService } from "../../../../../../core/shared/shared.service";
import {
    EstadoPostulacionEnum,
    RegimenLaboralEnum,
    TipoDocumentoIdentidadEnum,
} from "../../_utils/constants";

@Component({
    selector: "minedu-bandeja-postulante",
    templateUrl: "./bandeja-postulante.component.html",
    styleUrls: ["./bandeja-postulante.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPostulanteComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    maxLengthnumeroDocumentoIdentidad: number;
    etapaResponse: EtapaResponseModel;
    idEtapa: number;
    form: FormGroup;
    export = false;
    idServidorPublicoSelected: number;
    regimenLaboral = RegimenLaboralEnum;
    comboLists = {
        listTipoDocumento: [],
        listorigenesRegistro: [],
        listInstancia: [],
        listSubInstancia: [],
        listEstadoPostulacion: [],
    };
    displayedColumns: string[] = [
        "registro",
        "idInstancia",
        "idSubInstancia",
        "nuemeroDocumentoIdentidad",
        "cargo",
        "modalidad",
        "nivelEducativo",
        "areaCurricular",
        "origenRegistro",
        "estadoProceso",
        "acciones",
    ];
    estadoPostulacion = EstadoPostulacionEnum;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    dataSource: PostulantesDataSource | null;
    selection = new SelectionModel<any>(true, []);
    dialogRef: any;
    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    request = {
        idEtapa: null,
        idProceso: null,
        numeroDocumentoIdentidad: null,
        idTipoDocumentoIdentidad: null,
        idOrigenRegistro: null,
        idInstancia: null,
        idSubInstancia: null,
        idEstadoPostulacion: null,
    };
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
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) {}

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.idEtapa = this.route.snapshot.params.id;
        this.buildForm();
        this.handleResponsive();
        this.buildSeguridad();
        this.loadTipodocumento();
        this.loadInstancia();
        this.loadOrigenesRegistro();
        this.loadEstadosPostulacion();
        this.dataSource = new PostulantesDataSource(this.dataService);
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
        this.loadCentroTrabajo();
        this.resetForm();
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Postulantes");
        this.sharedService.setSharedTitle("Desarrollo de Contratación");
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
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            numeroDocumentoIdentidad: [null],
            idTipoDocumentoIdentidad: [null],
            idOrigenRegistro: [null],
            idInstancia: [null],
            idSubInstancia: [null],
            idEstadoPostulacion: [null],
        });
    }

    resetForm = () => {
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
            .get("idEstadoPostulacion")
            .setValue(this.opcionFiltro.item.value);
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

    handleLimpiar(): void {
        this.resetForm();
    }

    handleBuscar = () => {
        console.log('ENTREEEEEE');
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
    };

    setRequest = () => {
        this.request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            numeroDocumentoIdentidad: this.form.get("numeroDocumentoIdentidad")
                .value,
            idTipoDocumentoIdentidad: this.form.get("idTipoDocumentoIdentidad")
                .value,
            idOrigenRegistro: this.form.get("idOrigenRegistro").value,
            idInstancia: this.form.get("idInstancia").value,
            idSubInstancia: this.form.get("idSubInstancia").value,
            idEstadoPostulacion: this.form.get("idEstadoPostulacion").value,
        };
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
            .exportarExcelPostulacion(
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
                    saveAs(response, "postulaciones.xlsx");
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

    handleNuevo = () => {
        this.dialogRef = this.materialDialog.open(RegistraPostulanteComponent, {
            panelClass: "registra-postulante-dialog",
            width: "1080px",
            disableClose: true,
            data: {
                action: "registrar",
                idOperacion: TipoOperacionEnum.Registrar,
                idPostulacion: 0,
                etapaResponse: this.etapaResponse,
                currentSession: this.currentSession,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado === true) {
                this.handleBuscar();
            }
        });
    };

    handleRetornar = () => {
        this.router.navigate(["../../"], { relativeTo: this.route });
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

    buscarServidorPublico(): void {
        if (!this.form.valid) {
            // EX01: M01
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

    loadOrigenesRegistro = () => {
        this.dataService
            .Contrataciones()
            .getComboOrigenesRegistro()
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
                    this.comboLists.listorigenesRegistro = data;
                    this.comboLists.listorigenesRegistro.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    loadEstadosPostulacion = () => {
        this.dataService
            .Contrataciones()
            .getComboEstadosPostulacion()
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
                    this.comboLists.listEstadoPostulacion = data;
                    this.comboLists.listEstadoPostulacion.unshift({
                        value: this.opcionFiltro.item.value,
                        label: this.opcionFiltro.item.label,
                    });
                }
            });
    };

    handleEliminar = (row: any, i) => {
        /*     if (row?.codigoEstadoLicencia !== EstadoLicenciaEnum.REGISTRADO) {
                return;
            } */
        this.dialogRef = this.materialDialog.open(
            InformacionPostulanteComponent,
            {
                panelClass: "informacion-postulante-dialog",
                width: "1280px",
                disableClose: true,
                data: {
                    idPostulacion: row.idPostulacion,
                    eliminado: true,
                    etapaResponse: this.etapaResponse,
                    currentSession: this.currentSession,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    };

    handleEditar = (row) => {
        this.dialogRef = this.materialDialog.open(RegistraPostulanteComponent, {
            panelClass: "registra-postulante-dialog",
            width: "1080px",
            disableClose: true,
            data: {
                action: "editar",
                idOperacion: TipoOperacionEnum.Modificar,
                idPostulacion: row.idPostulacion,
                etapaResponse: this.etapaResponse,
                currentSession: this.currentSession,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    };

    handleInformacion = (row: any, i) => {
        /*     if (row?.codigoEstadoLicencia !== EstadoLicenciaEnum.REGISTRADO) {
                return;
            } */
        this.dialogRef = this.materialDialog.open(
            InformacionPostulanteComponent,
            {
                panelClass: "informacion-postulante-dialog",
                width: "1280px",
                disableClose: true,
                data: {
                    idPostulacion: row.idPostulacion,
                    eliminado: false,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    };

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
        // this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Eliminar);
        /*       console.log("getPassportRolSelected", this.dataService.Storage().getPassportRolSelected());
              console.log("getPassportSedeSelected", this.dataService.Storage().getPassportSedeSelected());
              console.log("getPassportUserData", this.dataService.Storage().getPassportUserData());
              console.log("getInformacionUsuario", this.dataService.Storage().getInformacionUsuario()); */
        this.permisos.autorizadoEnviar = true;
        this.currentSession = this.dataService
            .Storage()
            .getInformacionUsuario();
    };

    loadCentroTrabajo = () => {
        const codigoCentroTrabajo = this.currentSession.codigoSede;
        this.dataService
            .Contrataciones()
            .getCentroTrabajoByCodigo(codigoCentroTrabajo, true)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.centroTrabajo = response.data;
                }
            });
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

export class PostulantesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        this.dataService.Spinner().show("sp6");
        if (data.anio === null && data.idServidorPublico === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Contrataciones()
                .getListaPostulacion(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide("sp6");
                    })
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
