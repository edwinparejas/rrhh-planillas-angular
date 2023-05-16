import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { RotacionModel } from 'app/core/model/rotacion.model';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { isArray } from 'lodash';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { async } from 'rxjs/internal/scheduler/async';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { InformacionMotivoNoPublicacionPlazaComponent } from '../../components/informacion-motivo-no-publicacion-plaza/informacion-motivo-no-publicacion-plaza.component';
import { InformacionPlazaRotacionComponent } from '../../components/informacion-plaza-rotacion/informacion-plaza-rotacion.component';
import { MaestroPermisoPlazaModel } from '../../models/rotacion.model';

@Component({
    selector: 'minedu-bandeja-plazas-observadas',
    templateUrl: './bandeja-plazas-observadas.component.html',
    styleUrls: ['./bandeja-plazas-observadas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPlazasObservadasComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input()
    form: FormGroup;
    @Input() btnBuscar: Observable<void>;
    private btnBuscarSubscription: Subscription;
    @Input() permisoPlazaModel: MaestroPermisoPlazaModel;

    proceso: RotacionModel;
    plazaRotacion: any = null;
    dialogRef: any;
    working = false;
    isSeleccionadoTodos: boolean = false;
    totalSeleccionados: number = 0;

    displayedColumnsPlazas: string[] = [
        'select',
        'codigoModular',
        'centroTrabajo',
        'modalidad',
        'nivelEducativo',
        'tipoGestion',
        'codigoPlaza',
        'cargo',
        'grupoOcupacional',
        'categoriaRemunerativa',
        'tipoPlaza',
        'fechaVigenciaInicio',
        'acciones',
    ];
    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    request = {
        idDesarrolloProceso: null,
        codigoPlaza: null,
        codigoCentroTrabajo: null,
    };


    /*
    *-------------------------------------------------------------------------------------------------------------
    * VARIABLES PLAZAS OBSERVADAS
    *-------------------------------------------------------------------------------------------------------------
    */
    dataSourceObservadas: ObservadasDataSource | null;
    selectionObservadas = new SelectionModel<any>(true, []);
    noSeleccionados: any[] = [];
    @ViewChild('paginatorObservadas', { static: true }) paginatorObservadas: MatPaginator;

    private _unsubscribeAll: Subject<any>;
    constructor(
        private activeRoute: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.activeRoute.data.subscribe((data) => {
            if (data) {
                this.proceso = data.ProcesoEtapa;
                this.buildGrid();
            }
        });
        this.sharedService.onDataSharedRotacion
            .pipe(
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(rotacion => this.plazaRotacion = rotacion);

        this.btnBuscarSubscription = this.btnBuscar.subscribe(() => this.getDataGridObservadas());
    }

    private buildGrid() {
        this.dataSourceObservadas = new ObservadasDataSource(this.dataService, this.sharedService);
        this.buildPaginators(this.paginatorObservadas);
    }

    private buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = 'Registros por página';
        paginator._intl.nextPageLabel = 'Siguiente página';
        paginator._intl.previousPageLabel = 'Página anterior';
        paginator._intl.firstPageLabel = 'Primera página';
        paginator._intl.lastPageLabel = 'Última página';
    }

    ngAfterViewInit(): void {
        this.paginatorObservadas.page.subscribe(() => this.getDataGridObservadas());
        setTimeout(() => { this.dataService.Spinner().show('sp6'); this.getDataGridObservadas(); }, 0);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.btnBuscarSubscription.unsubscribe();
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb('Procesos de rotación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de rotación');
    }

    /*
        *-------------------------------------------------------------------------------------------------------------
        * OPERACIONES PLAZAS OBSERVADAS
        *-------------------------------------------------------------------------------------------------------------
        */

    private getDataGridObservadas = async () => {
        this.setRequest();
        const data = await this.dataSourceObservadas.load(
            this.request,
            this.paginatorObservadas.pageIndex + 1,
            this.paginatorObservadas.pageSize
        );

        if (this.isSeleccionadoTodos) {
            this.masterToggleObservadasNavigacion();
        }
    };

    masterToggleObservadasNavigacion = () => {
        this.selectionObservadas.clear();
        this.dataSourceObservadas.data.forEach(row => {
            const exist = this.noSeleccionados.find(x => x.idPlazaRotacionDetalle == row.idPlazaRotacionDetalle);
            if (exist == null) {
                this.selectionObservadas.select(row)
            }
        });
    };

    selectedRow = (row) => {
        this.selectionObservadas.toggle(row)
        if (this.isSeleccionadoTodos) {
            const exist = this.selectionObservadas.selected.find(x => x.idPlazaRotacionDetalle == row.idPlazaRotacionDetalle);
            if (exist == null) {
                this.agregarNoSeleccionados(row, true);
            } else {
                this.agregarNoSeleccionados(row, false);
            }
        }

        this.changeTotalSeleccionados();
    };

    agregarNoSeleccionados = (row, estado: boolean) => {
        if (estado) {
            const exist = this.noSeleccionados.find(x => x.idPlazaRotacionDetalle == row.idPlazaRotacionDetalle);
            if (exist == null) {
                this.noSeleccionados.push(row);
            }
        } else {
            const seleccionados = Object.assign([], this.noSeleccionados);
            this.noSeleccionados = [];
            seleccionados.forEach(element => {
                if (element.idPlazaRotacionDetalle != row.idPlazaRotacionDetalle) {
                    this.noSeleccionados.push(row);
                }
            });
        }
    }

    masterToggleObservadas = () => {
        if (this.isSeleccionadoTodos == true)
            this.isSeleccionadoTodos = false;
        else
            this.isSeleccionadoTodos = true;

        if (this.isSeleccionadoTodos) {
            this.selectionObservadas.clear();
            this.noSeleccionados = [];
            this.dataSourceObservadas.data.forEach(row => {
                this.selectionObservadas.select(row)
            });
        } else {
            this.selectionObservadas.clear();
            this.noSeleccionados = [];
        }

        this.changeTotalSeleccionados();
    };

    // No se utiliza este metodo
    isAllSelectedObservadas = (): boolean => {
        const numSelected = this.selectionObservadas.selected.length;
        const numRows = this.dataSourceObservadas.data.length;
        return numSelected === numRows;
    };

    // No se utiliza este metodo
    selectedGridObservadas = (param) => {
        this.selectionObservadas.toggle(param);
    };

    changeTotalSeleccionados = () => {
        if (this.isSeleccionadoTodos == true)
            this.totalSeleccionados = this.dataSourceObservadas?.dataTotal - this.noSeleccionados?.length;
        else
            this.totalSeleccionados = this.selectionObservadas?.selected?.length;
    }

    handleVerMotivoNoPublicacion = (row) => {
        this.dialogRef = this.materialDialog.open(InformacionMotivoNoPublicacionPlazaComponent,
            {
                panelClass: 'informacion-sustento-motivo-no-publicacion',
                disableClose: true,
                data: {
                    idPlazaRotacion: this.plazaRotacion.idPlazaRotacion,
                    idPlazaRotacionDetalle: row.idPlazaRotacionDetalle
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            this.selectionObservadas.clear();
        });
    }

    handleVerInformacionPlaza = (row) => {
        this.dialogRef = this.materialDialog.open(InformacionPlazaRotacionComponent,
            {
                panelClass: 'informacion-plaza',
                disableClose: true,
                data: {
                    idPlazaRotacion: this.plazaRotacion.idPlazaRotacion,
                    idPlazaRotacionDetalle: row.idPlazaRotacionDetalle
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            this.selectionObservadas.clear();
        });
    }

    private getDataObservadasTodos = async () => {
        this.setRequest();
        return new Promise<{ success: boolean; data: [] }>(async resolve => {
            return this.dataService.Rotacion()
                .getGridPlazaRotacionObservadas(this.request, 1, 20000000)
                .pipe(
                    catchError((e) => { return this.configCatch(e); }),
                    finalize(() => {
                        this.dataService.Spinner().hide('sp6');
                    })
                )
                .subscribe((response: any) => {
                    const { rotacion, rows } = response;
                    resolve({ success: false, data: rows });
                });
        });
    };

    handleConvocarPlazasObservadas = async () => {
        let plazasObservadas: any[] = [];
        if (this.isSeleccionadoTodos) {
            const resultDataTodos = await this.getDataObservadasTodos();
            const data: any[] = resultDataTodos.data;

            if (this.noSeleccionados.length == 0) {
                plazasObservadas = data;
            } else {
                data.forEach(prepublicada => {
                    const exist = this.noSeleccionados.find(x => x.idPlazaRotacionDetalle == prepublicada.idPlazaRotacionDetalle);
                    if (exist == null) {
                        plazasObservadas.push(prepublicada);
                    }
                });
            }
        } else {
            plazasObservadas = this.selectionObservadas.selected;
        }

        if (plazasObservadas.length === 0) {
            this.dataService.Message().msgWarning('SELECCIONE AL MENOS UN REGISTRO PARA PROCEDER CON LA OPERACIÓN.', () => { });
            return;
        }
        const plazasRotacionDetalle = plazasObservadas.map(t => { return t.idPlazaRotacionDetalle });
        const data = {
            plazasRotacionDetalle: plazasRotacionDetalle,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idPlazaRotacion: this.plazaRotacion.idPlazaRotacion,
            seleccionadoTodos: this.isAllSelectedObservadas()
        };

        this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA CONVOCAR LAS PLAZAS?", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Rotacion()
                .enviarPlazasObservadasToConvocadas(data)
                .pipe(
                    catchError((e) => { return this.configCatch(e); }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.getDataGridObservadas();
                        this.masterToggleObservadas();
                        this.selectionObservadas.clear();
                        this.dataService.Message().msgAutoCloseSuccessNoButton('LAS PLAZAS SELECCIONADAS SE ENVIARON CORRECTAMENTE A PLAZAS CONVOCADAS.', 3000, () => { });
                    } else {
                        this.dataService.Message().msgWarning('ERROR AL ENVIAR LAS PLAZAS OBSERVADAS A CONVOCADAS.', () => { });
                    }
                });

        }, () => { });

    };

    handleExportarPlazasObservadas = () => {
        if (this.dataSourceObservadas.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    'NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR.',
                    () => {
                    }
                );
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .exportarPlazaRotacionObservadas(this.request)
            .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'plazas observadas.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO.',
                            () => {
                            }
                        );
                }
            });
    };

    verMotivoNoPublicacion = (row) => {
    };

    private setRequest = () => {
        this.request = {
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value,
        };
    };
    private configCatch(e: any) {
        if (e && e.status === 400 && isArray(e.messages)) {
            this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if (isArray(e.messages)) {
            if ((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD") != -1)
                this.dataService.Util().msgError(e.messages[0], () => { });
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { });

        } else {
            this.dataService.Util().msgError('ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e)
    }
}


export class ObservadasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    async load(data: any, pageIndex, pageSize) {
        return new Promise<{ success: boolean; data: string }>(async resolve => {
            return this.dataService.Rotacion()
                .getGridPlazaRotacionObservadas(data, pageIndex, pageSize)
                .pipe(
                    catchError((e) => { return this.configCatch(e); }),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide('sp6');
                        this.sharedService.sendWorking(false);
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        const { rotacion, rows } = response;
                        this.sharedService.sendRotacionData(rotacion);
                        if (rows.length == 0) {
                            this.gridResultMessage();
                        } else {
                            this.totalregistro = (rows || []).length === 0 ? 0 : rows[0].totalRegistros;
                            this._dataChange.next(rows || []);
                        }

                    } else {
                        this.gridResultMessage(false);
                    }
                    resolve({ success: false, data: response });
                });
        })
    }

    private gridResultMessage = (emptyResult: boolean = true) => {
        this.totalregistro = 0;
        this._dataChange.next([]);
        if (emptyResult) {
            this.dataService.Message().msgWarning('NO SE ENCONTRÓ INFORMACIÓN DE PLAZAS OBSERVADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.', () => {
            });
        } else {
            this.dataService.Message().msgWarning('OCURRIERON PROBLEMAS AL MOMENTO DE BUSCAR PLAZAS OBSERVADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.', () => { });
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
    private configCatch(e: any) {
        if (e && e.status === 400 && isArray(e.messages)) {
            this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if (isArray(e.messages)) {
            if ((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD") != -1)
                this.dataService.Util().msgError(e.messages[0], () => { });
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { });

        } else {
            this.dataService.Util().msgError('ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e)
    }
}
