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
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { descargarExcel } from "app/core/utility/functions";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { catchError, finalize, map, tap } from "rxjs/operators";
import { FormType, COD_ESTADO_PLAN_ESTUDIO } from "../util/enum";
import { MESSAGE_CUADRO_30512 } from "../util/messages";
import { ModalAgregarPlanComponent } from "./modal-agregar-plan/modal-agregar-plan.component";
import { ModalCancelarVigenciaPlanComponent } from "./modal-cancelar-vigencia-plan/modal-cancelar-vigencia-plan.component";
import * as moment from "moment";

@Component({
    selector: "minedu-plan-estudios",
    templateUrl: "./plan-estudios.component.html",
    styleUrls: ["./plan-estudios.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PlanEstudiosComponent implements OnInit, OnDestroy, AfterViewInit {
    combos = {
        planesEstudio: [],
        estadosPlan: [],
    };
    working: boolean = false;
    export: boolean = false;
    form: FormGroup;

    dataSource: PlanesEstudioDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;
    displayedColumns: string[] = [
        "rowNum",
        "nombrePlanEstudio",
        "dsEstadoPlanEstudio",
        "opciones",
    ];
    dialogRef: any;
    estadoRegistradoEnum = COD_ESTADO_PLAN_ESTUDIO.REGISTRADO;
    estadoVigenteEnum = COD_ESTADO_PLAN_ESTUDIO.VIGENTE;
    estadoNoVigenteEnum = COD_ESTADO_PLAN_ESTUDIO.NO_VIGENTE;
    constructor(
        private dataService: DataService,
        private formBuilder: FormBuilder,
        private sharedService: SharedService,
        private materialDialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.handleGrid())).subscribe();
    }
    ngOnDestroy(): void {
        // this._unsubscribeAll.next();
        // this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.buildForm();
        this.defaultGrid();
        this.loadForm().subscribe((r) => {
            this.handleGridFirst();
        });
    }

    buildShared = () => {
        this.sharedService.setSharedBreadcrumb("Cuadro Horas 30512");
        this.sharedService.setSharedTitle("Gestión Plan de Estudio");
    };

    private loadForm = () => {
        return forkJoin([
            this.dataService
                .CuadroHoras30512Service()
                .getComboEstadoPlanEstudio(),
            this.dataService.CuadroHoras30512Service().getComboPlanEstudio(0),
        ]).pipe(
            map((resp) => {
                this.setComboEstadosPlan(resp[0]);
                this.setComboPlanesEstudio(resp[1]);
            }),
            catchError(() => {
                return of([]);
            }),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
            })
        );
    };

    private setComboEstadosPlan = (list: any) => {
        this.combos.estadosPlan = list.map((x) => ({
            ...x,
            value: x.idCatalogoItem,
            label: `${x.descripcionCatalogoItem}`,
        }));
    };
    private setComboPlanesEstudio = (list: any) => {
        this.combos.planesEstudio = list.map((x) => ({
            ...x,
            value: x.idPlanEstudio,
            label: `${x.nombrePlanEstudio}`,
        }));
    };

    buildForm() {
        this.form = this.formBuilder.group({
            idPlanEstudio: [null],
            idEstadoPlanEstudio: [null],
        });
    }

    handleLimpiar = () => {
        this.form.patchValue({
            idPlanEstudio: null,
            idEstadoPlanEstudio: null,
        });
        this.handleGridFirst();
    };
    handleBuscar = () => {
        if (this.validateBuscar()) this.handleGrid();
    };

    private validateBuscar = (): boolean => {
        const form = this.form.value;
        if (
            (form.idPlanEstudio == null || form.idPlanEstudio == undefined) &&
            (form.idEstadoPlanEstudio == null ||
                form.idEstadoPlanEstudio == undefined)
        ) {
            this.dataService
                .Message()
                .msgWarning(MESSAGE_CUADRO_30512.M06, () => {});
            return false;
        }
        return true;
    };

    handleVerDetalle = (row: any) => {
        this.router.navigate(["../plan-estudio/" + row.idPlanEstudio], {
            relativeTo: this.route,
        });
    };

    handleActivar = (row: any) => {
        this.dataService.Message().msgConfirm(
            MESSAGE_CUADRO_30512.M03,
            () => {
                this.activarComfirmar(row);
            },
            () => {}
        );
    };
    private activarComfirmar = (row: any) => {
        this.dataService.Spinner().show("sp6");
        this.working = true;
        const user = this.dataService.Storage().getPassportUserData();
        const idEstadoPlanEstudio = this.findIdCatalogoItem(
            COD_ESTADO_PLAN_ESTUDIO.VIGENTE
        );
        const data = {
            idPlanEstudio: row.idPlanEstudio,
            idEstadoPlanEstudio: idEstadoPlanEstudio,
            usuarioRegistro: user.NUMERO_DOCUMENTO,
        };
        this.dataService
            .CuadroHoras30512Service()
            .activarPlanEstudio(data)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.dataService
                        .Message()
                        .msgWarning(error.error.messages[0]);
                    return of(null);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this.working = false;
                })
            )
            .subscribe((response) => {
                if (response && response > 0) {
                    this.dataService
                        .Message()
                        .msgSuccess(MESSAGE_CUADRO_30512.M07, () => {
                            this.handleGrid();
                        });
                }
            });
    };

    handleCancelarVigencia = (row: any) => {
        const modal = {
            icon: "cancel",
            title: "Cancelar vigencia",
            action: FormType.REGISTRAR,
            disabled: true,
        };
        this.loadModalCancelarVigencia(row, modal);
    };

    handleVerCancelarVigencia = (row: any) => {
        const modal = {
            icon: "cancel",
            title: "Cancelar vigencia",
            action: FormType.CONSULTAR,
            disabled: true,
        };
        this.loadModalCancelarVigencia(row, modal);
    };
    private loadModalCancelarVigencia = (row: any, modal: any) => {
        const idEstadoPlanEstudio = this.findIdCatalogoItem(
            COD_ESTADO_PLAN_ESTUDIO.NO_VIGENTE
        );
        this.dialogRef = this.materialDialog.open(
            ModalCancelarVigenciaPlanComponent,
            {
                panelClass: "modal-cancelar-vigencia-form-dialog",
                disableClose: true,
                data: {
                    modal: modal,
                    idPlanEstudio: row.idPlanEstudio,
                    motivoNoVigencia: row.motivoNoVigencia,
                    idEstadoPlanEstudio: idEstadoPlanEstudio,
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
            if (response.reload) {
                this.handleGrid();
            }
        });
    };

    handleGrid = () => {
        const d = this.setForm();
        this.dataSource.load(
            d,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    };

    private setForm = () => {
        const form = this.form.value;
        return {
            idPlanEstudio: form.idPlanEstudio,
            idEstadoPlanEstudio: form.idEstadoPlanEstudio,
        };
    };

    private handleGridFirst = () => {
        const d = this.setFormFirst();
        this.dataSource.load(
            d,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    };

    private setFormFirst = () => {
        return {
            idPlanEstudio: "-1",
            idEstadoPlanEstudio: "-1",
        };
    };

    handleCrear = () => {
        const modal = {
            icon: "save",
            title: "Nuevo Plan de Estudio",
            action: FormType.REGISTRAR,
            disabled: true,
        };
        this.loadMOdalAgregarPlan(modal);
    };

    private loadMOdalAgregarPlan = (modal: any) => {
        const idEstadoPlanEstudio = this.findIdCatalogoItem(
            COD_ESTADO_PLAN_ESTUDIO.REGISTRADO
        );
        this.dialogRef = this.materialDialog.open(ModalAgregarPlanComponent, {
            panelClass: "modal-agregar-plan-form-dialog",
            disableClose: true,
            data: {
                modal: modal,
                idEstadoPlanEstudio: idEstadoPlanEstudio,
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
            if (response.reload) {
                this.handleGrid();
            }
        });
    };

    private findIdCatalogoItem = (codEstadoPlanEstudio: number): number => {
        if (this.combos.estadosPlan) {
            return this.combos.estadosPlan.find(
                (x) => x.codigoCatalogoItem == codEstadoPlanEstudio
            ).idCatalogoItem;
        }
        return null;
    };

    handleExportar = () => {
        const form = this.form.value;
        const d = {
            idPlanEstudio:
                form.idPlanEstudio === "-1" ? null : form.idPlanEstudio,
            idEstadoPlanEstudio:
                form.idEstadoPlanEstudio === "-1"
                    ? null
                    : form.idEstadoPlanEstudio,
        };

        this.dataService.Spinner().show("sp6");
        this.dataService
            .CuadroHoras30512Service()
            .exportarPlanEstudio(d)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.dataService
                        .Message()
                        .msgWarning(error.error.messages[0]);
                    return of(null);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    let nameFile = `Plan de Estudios_${moment().format(
                        "DD-MM-YYYY"
                    )}.xlsx`;
                    descargarExcel(response, nameFile);
                }
            });
    };

    defaultGrid = () => {
        this.dataSource = new PlanesEstudioDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";
    };
}

export class PlanesEstudioDataSource extends DataSource<any> {
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
        this.dataService
            .CuadroHoras30512Service()
            .getPlanEstudioPaginado(data, pageIndex, pageSize)
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    this.dataService
                        .Message()
                        .msgWarning(error.error.messages[0]);
                    return of(null);
                }),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
                })
            )
            .subscribe((response: any) => {
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
            });
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
