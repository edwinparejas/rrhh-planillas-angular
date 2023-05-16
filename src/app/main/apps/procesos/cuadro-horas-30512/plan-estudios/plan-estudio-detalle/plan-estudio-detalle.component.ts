import {
    CollectionViewer,
    DataSource,
    SelectionModel,
} from "@angular/cdk/collections";
import { HttpErrorResponse } from "@angular/common/http";
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import {
    TablaConfiguracionFuncionalidad,
    TablaConfiguracionSistema,
} from "app/core/model/types";
import { SharedService } from "app/core/shared/shared.service";
import { descargarExcel } from "app/core/utility/functions";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { MESSAGE_CUADRO_30512 } from "../../util/messages";
import { IPlanDetalleFiltroForm } from "../interfaces/plan-estudios.store.interface";
import {
    ModalVerCompetenciaModel,
    ModalVerFormacionModel,
    PlanEstudioDetalleModel,
} from "../interfaces/plan-estudios.store.model";
import { ModalVerCompetenciaComponent } from "./modal-ver-competencia/modal-ver-competencia.component";
import { ModalVerFormacionComponent } from "./modal-ver-formacion/modal-ver-formacion.component";
import * as moment from "moment";

@Component({
    selector: "minedu-plan-estudio-detalle",
    templateUrl: "./plan-estudio-detalle.component.html",
    styleUrls: ["./plan-estudio-detalle.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PlanEstudioDetalleComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    dataSource: PlanesEstudioDetalleDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;
    dialogRef: any;

    state = new PlanEstudioDetalleModel();
    constructor(
        private dataService: DataService,
        private sharedService: SharedService,
        private router: Router,
        private route: ActivatedRoute,
        private materialDialog: MatDialog
    ) {
        this.state.idPlanEstudio = this.route.snapshot.params["idPlanEstudio"];
    }

    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.loadGrid())).subscribe();
    }
    ngOnDestroy(): void {
        this.state = new PlanEstudioDetalleModel();
    }
    ngOnInit(): void {
        this.loadForm();
        setTimeout((_) => this.buildShared());
        this.defaultGrid();
    }

    private loadForm = () => {
        this.setLoadingAll(true);
        this.dataService
            .CuadroHoras30512Service()
            .getPlanEstudio(this.state.idPlanEstudio)
            .subscribe((resp) => {
                this.setPlanEstudio(resp);
                this.setLoadingAll(false);
            });
    };

    private setPlanEstudio = (plan: any) => {
        this.state.planEstudio = plan;
    };

    private buildShared = () => {
        this.sharedService.setSharedBreadcrumb("Cuadro Horas 30512");
        this.sharedService.setSharedTitle(this.state.title);
    };

    handleBuscar = (form: IPlanDetalleFiltroForm) => {
        this.state.detalleFiltro.formModel = form;
        this.loadGrid();
    };

    private getDataForService = (form: IPlanDetalleFiltroForm) => {
        return {
            idPlanEstudio: parseInt(this.state.idPlanEstudio),
            idAreaComponenteCurricular:
                form.idAreaComponenteCurricular === "-1"
                    ? null
                    : form.idAreaComponenteCurricular,
            idCarreraProgramaEstudios:
                form.idCarreraProgramaEstudios === "-1"
                    ? null
                    : form.idCarreraProgramaEstudios,
            idCiclo: form.idCiclo === "-1" ? null : form.idCiclo,
            idCursoModulo:
                form.idCursoModulo === "-1" ? null : form.idCursoModulo,
            idFormacionProfesional:
                form.idFormacionProfesional === "-1"
                    ? null
                    : form.idFormacionProfesional,
        };
    };

    private loadGrid = () => {
        this.setLoadingAll(true);
        const d = this.getDataForService(this.state.detalleFiltro.formModel);
        this.dataSource
            .load(d, this.paginator.pageIndex + 1, this.paginator.pageSize)
            .subscribe((r) => {
                this.setLoadingAll(false);
            });
    };

    private setLoadingAll = (isLoading: boolean) => {
        this.state.detalleFiltro.isLoading = isLoading;
        this.state.isLoading = isLoading;
    };

    handleCargaMasiva = () => {
        const data = {
            idPlanEstudio: this.state.idPlanEstudio,
            codigo: 0,
        };
        const param = this.routeGenerator(data);
        this.router.navigate([param, "cargamasiva"], {
            relativeTo: this.route,
        });
    };

    private routeGenerator = (data: any): string => {
        const param =
            (TablaConfiguracionSistema.PERSONAL + "").padStart(3, "0") +
            (
                TablaConfiguracionFuncionalidad.GESTIONAR_PLAN_ESTUDIOS + ""
            ).padStart(4, "0") +
            (data.idPlanEstudio + "").padStart(10, "0") +
            (data.codigo + "").padStart(10, "0") +
            "0000000000";

        return param;
    };

    handleEliminarCargaMasiva = () => {
        this.dataService.Message().msgConfirm(
            MESSAGE_CUADRO_30512.M01,
            () => {
                this.deleteCargaMasiva();
            },
            () => {}
        );
    };

    private deleteCargaMasiva = () => {
        const user = this.dataService.Storage().getPassportUserData();
        const form = {
            codigoCargaMasiva: this.state.planEstudio.codigoCargamasiva,
            usuarioRegistro: user.NUMERO_DOCUMENTO,
        };
        this.setLoadingAll(true);
        this.dataService
            .CuadroHoras30512Service()
            .deletePlanEstudio(form)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    let e = error.error.messages[0];
                    if (e == "") {
                        e = MESSAGE_CUADRO_30512.M04;
                    }
                    this.dataService
                        .Message()
                        .msgWarning(error.error.messages[0]);
                    return of(null);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this.setLoadingAll(false);
                })
            )
            .subscribe((response) => {
                if (response && response.success > 0) {
                    this.state.planEstudio.codigoCargamasiva = null;
                    this.dataService
                        .Message()
                        .msgSuccess(MESSAGE_CUADRO_30512.M07, () => {
                            this.loadGrid();
                        });
                }
            });
    };
    handleExportar = () => {
        const d = this.getDataForService(this.state.detalleFiltro.formModel);
        this.dataService.Spinner().show("sp6");
        this.setLoadingAll(true);
        this.dataService
            .CuadroHoras30512Service()
            .exportarPlanEstudioDetalle(d)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.dataService
                        .Message()
                        .msgWarning(error.error.messages[0]);
                    return of(null);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this.setLoadingAll(false);
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    let nameFile = `Plan de Estudios_${
                        this.state.planEstudio.nombrePlanEstudio
                    }_${moment().format("DD-MM-YYYY")}.xlsx`;
                    descargarExcel(response, nameFile);
                }
            });
    };

    handleRetornar = () => {
        this.router.navigate(["../../plan-estudio"], {
            relativeTo: this.route,
        });
    };

    handleVerCompotencia = (row: any) => {
        let competencia = new ModalVerCompetenciaModel();
        competencia.codigos = row.competenciaNivelGrupo;

        this.dialogRef = this.materialDialog.open(
            ModalVerCompetenciaComponent,
            {
                panelClass: "minedu-modal-ver-competencia",
                disableClose: true,
                data: { competencia },
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {});
    };

    handleVerFormacion = (row: any) => {
        let formacion = new ModalVerFormacionModel();
        formacion.codigos = row.formacionProfesionalGrupo;

        this.dialogRef = this.materialDialog.open(ModalVerFormacionComponent, {
            panelClass: "minedu-modal-ver-formacion",
            disableClose: true,
            data: { formacion },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {});
    };

    private defaultGrid = () => {
        this.dataSource = new PlanesEstudioDetalleDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
    };
}

export class PlanesEstudioDetalleDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _totalRows = 0;
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex: number, pageSize: number) {
        this._loadingChange.next(true);
        this.dataService.Spinner().show("sp6");
        return forkJoin([
            this.dataService
                .CuadroHoras30512Service()
                .getPlanEstudioDetallePaginado(data, pageIndex, pageSize),
        ]).pipe(
            map((resp: any) => {
                const response = resp[0];
                if (response && (response || []).length > 0) {
                    this._totalRows = (
                        response[0] || [{ rowTotal: 0 }]
                    ).rowTotal;
                    this._dataChange.next(response || []);
                } else {
                    this._totalRows = 0;
                    this._dataChange.next([]);
                }
                if (this._totalRows == 0) {
                    this.dataService
                        .Message()
                        .msgWarning(MESSAGE_CUADRO_30512.M09, () => {});
                }
            }),
            catchError((error: HttpErrorResponse) => {
                this.dataService.Message().msgWarning(error.error.messages[0]);
                return of(null);
            }),
            finalize(() => {
                this._loadingChange.next(false);
                this.dataService.Spinner().hide("sp6");
                return false;
            })
        );
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this._totalRows;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}
