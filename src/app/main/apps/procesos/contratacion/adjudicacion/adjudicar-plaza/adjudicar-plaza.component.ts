import {
    CollectionViewer,
    DataSource,
    SelectionModel,
} from "@angular/cdk/collections";
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
import { MatRadioChange } from "@angular/material/radio";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SecurityModel } from "app/core/model/security/security.model";
import { ResultadoOperacionEnum, TablaPermisos } from "app/core/model/types";
import { SharedService } from "app/core/shared/shared.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { BuscarCentroTrabajoComponent } from "../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BusquedaPlazaComponent } from "../../components/busqueda-plaza/busqueda-plaza.component";
import {
    EtapaResponseModel,
    CalificacionResponse,
} from "../../models/contratacion.model";
import {
    RegimenLaboralEnum,
    TipoFormatoPlazaEnum,
} from "../../_utils/constants";
import { forEach } from "lodash";

@Component({
    selector: "minedu-adjudicar-plaza",
    templateUrl: "./adjudicar-plaza.component.html",
    styleUrls: ["./adjudicar-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class AdjudicarPlazaComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    etapaResponse: EtapaResponseModel;
    form: FormGroup;
    formFecha: FormGroup;
    export = false;
    idServidorPublicoSelected: number;
    regimenLaboral = RegimenLaboralEnum;
    currentSession: SecurityModel = new SecurityModel();
    @ViewChild("paginator", { static: true }) paginator: MatPaginator;
    dataSource: AdjudicarPlazaDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    calificacion: CalificacionResponse;
    dialogRef: any;
    idCalificacion: number;
    idAdjudicacion: number;
    maxDate = new Date();
    minDate = new Date();

    request = {
        idProceso: null,
        idEtapa: null,
        codigoPlaza: null,
        descripcionCentroTrabajo: null,
        codigoCentroTrabajo: null,
        idRegimenLaboral: null,
        tipoFormato: TipoFormatoPlazaEnum.GENERAL,
    };

    comboLists = {
        listTipoDocumento: [],
        listorigenesRegistro: [],
    };

    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false,
    };

    displayedColumns: string[] = [
        "registro",
        "codigoPlaza",
        "tipoPlaza",
        "codigoModular",
        "centroTrabajo",
        "modalidad",
        "nivelEducativo",
        "tipoGestion",
        "zona",
        "eib",
        "areaCurricular",
        "cargo",
        "jornadaLaboral",
        "motivoVacancia",
        "vigenciaDesde",
        "vigenciaHasta",
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
    selectedRow;

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
        this.handleResponsive();
        this.buildSeguridad();
        this.buildForm();
        this.idCalificacion = this.route.snapshot.params.id;
        this.idAdjudicacion = this.route.snapshot.params.id1;
        this.dataSource = new AdjudicarPlazaDataSource(this.dataService);
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
        this.loadCalificacion();
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

    buildForm = () => {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            codigoCentroTrabajo: [null],
        });

        this.formFecha = this.formBuilder.group({
            fechaDesde: [null, Validators.required],
            fechaHasta: [null, Validators.required],
        });
    };

    obtenerEtapa = (idEtapa) => {
        this.dataService
            .Contrataciones()
            .obtenerCabeceraEtapaProcesoById(idEtapa)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.etapaResponse = response.data;
                    this.buscarPlaza();
                }
            });
    };

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    setRequest(): void {
        this.request = this.form.getRawValue();
        (this.request.idProceso = this.etapaResponse.idProceso),
            (this.request.idEtapa = this.etapaResponse.idEtapa),
            (this.request.tipoFormato = TipoFormatoPlazaEnum.GENERAL);
        this.request.idRegimenLaboral = this.etapaResponse.idRegimenLaboral;
        this.request.descripcionCentroTrabajo = null;
    }

    handleBuscar(): void {
        this.buscarPlaza();
    }

    buscarPlaza = () => {
        this.setRequest();
        /*
        if (this.request.codigoPlaza === null &&            
            this.request.codigoCentroTrabajo === null &&
            this.request.idRegimenLaboral === null) {
            this.dataService.Message().msgWarning('Debe especificar por lo menos un criterio de búsqueda.', () => { });
        } else {
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        }
        */
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    };

    loadData(pageIndex, pageSize): void {
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Contratación / Adjudicación");
        this.sharedService.setSharedTitle("Desarrollo de Contratación");
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
        // this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService
            .Storage()
            .tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = true;
        this.currentSession = this.dataService
            .Storage()
            .getInformacionUsuario();
    };

    loadCalificacion = () => {
        this.dataService
            .Contrataciones()
            .getCalificacion(this.idCalificacion)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.calificacion = response.data;
                    this.obtenerEtapa(this.calificacion.idEtapa);
                }
            });
    };

    handleRetornar = () => {
        this.router.navigate(
            ["../../../adjudicacion/" + this.calificacion.idEtapa],
            { relativeTo: this.route }
        );
    };

    busquedaPlazaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(BusquedaPlazaComponent, {
            panelClass: "buscar-plaza-dialog",
            width: "1080px",
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
                this.buscarPlaza();
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
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form
                    .get("codigoCentroTrabajo")
                    .setValue(result.centroTrabajo.codigoCentroTrabajo);
                this.buscarPlaza();
            }
        });
    };

    configurarFechaFin = () => {
        this.formFecha.get("fechaHasta").setValue(null);
        this.maxDate = this.formFecha.get("fechaDesde").value;
        this.minDate = this.formFecha.get("fechaDesde").value;
    };

    radioSelected() {
        this.formFecha.get("fechaDesde").setValue(null);
        this.formFecha.get("fechaHasta").setValue(null);
        this.dataSource.data.forEach((element) => {
            element.selected = false;
            if (element.idPlaza == this.selectedRow.idPlaza) {
                element.selected = true;
            }
        });
    }

    handleAdjudicarPlaza = () => {
        if (!this.formFecha.valid) {
            this.dataService
                .Message()
                .msgWarning("Completar los datos requeridos.", () => {});
            return;
        }

        const request = {
            idCalificacion: this.calificacion.idCalificacion,
            idPlaza: this.selectedRow.idPlaza,
            vigenciaInicioContrato: this.formFecha.get("fechaDesde").value,
            vigenciaFinContrato: this.formFecha.get("fechaHasta").value,
            usuarioRegistro: this.currentSession.numeroDocumento,
        };

        const resultMessage = "Operación realizada de forma exitosa.";
        this.dataService.Message().msgConfirm(
            "¿Está seguro de que desea adjudicar la plaza?",
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Contrataciones()
                    .adjudicarPlaza(request)
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
                            // this.buscarPlaza();
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
                                    "Ocurrieron algunos problemas al adjudicar la plaza.",
                                    () => {}
                                );
                        }
                    });
            },
            (error) => {}
        );
    };
}

export class AdjudicarPlazaDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        // this.dataService.Spinner().show('sp6');
        if (data.anio === null && data.idServidorPublico === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Contrataciones()
                .getListaPlazaAdjudicacion(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                        // this.dataService.Spinner().hide('sp6');
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
                                "No se encontró información de la(s) plazas para los criterios de búsqueda ingresados.",
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
