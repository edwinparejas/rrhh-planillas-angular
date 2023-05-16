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
import { InformacionPlazaRotacionComponent } from '../../components/informacion-plaza-rotacion/informacion-plaza-rotacion.component';
import { SustentoMotivoNoPublicacionPlazaComponent } from '../../components/sustento-motivo-no-publicacion-plaza/sustento-motivo-no-publicacion-plaza.component';
import { MaestroPermisoPlazaModel } from '../../models/rotacion.model';

@Component({
    selector: 'minedu-bandeja-plazas-convocadas',
    templateUrl: './bandeja-plazas-convocadas.component.html',
    styleUrls: ['./bandeja-plazas-convocadas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPlazasConvocadasComponent implements OnInit, OnDestroy, AfterViewInit {

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
    * VARIABLES PLAZAS A CONVOCAR
    *-------------------------------------------------------------------------------------------------------------
    */
    dataSourceConvocadas: ConvocadasDataSource | null;
    selectionConvocadas = new SelectionModel<any>(true, []);
    noSeleccionados: any[] = [];
    @ViewChild('paginatorConvocadas', { static: true }) paginatorConvocadas: MatPaginator;

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
        this.btnBuscarSubscription = this.btnBuscar.subscribe(() => this.getDataGridConvocadas());
    }

    private buildGrid() {
        this.dataSourceConvocadas = new ConvocadasDataSource(this.dataService, this.sharedService);

        this.buildPaginators(this.paginatorConvocadas);
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
        this.paginatorConvocadas.page.subscribe(() => this.getDataGridConvocadas());
        setTimeout(() => { this.dataService.Spinner().show('sp6'); this.getDataGridConvocadas(); }, 0);
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
       * OPERACIONES PLAZAS A CONVOCAR
       *-------------------------------------------------------------------------------------------------------------
       */

    private getDataGridConvocadas = async () => {
        this.setRequest();
        const data = await this.dataSourceConvocadas.load(
            this.request,
            this.paginatorConvocadas.pageIndex + 1,
            this.paginatorConvocadas.pageSize
        );

        if (this.isSeleccionadoTodos) {
            this.masterToggleConvocadasNavigacion();
        }
    };

    masterToggleConvocadasNavigacion = () => {
        this.selectionConvocadas.clear();
        this.dataSourceConvocadas.data.forEach(row => {
            const exist = this.noSeleccionados.find(x => x.idPlazaRotacionDetalle == row.idPlazaRotacionDetalle);
            if (exist == null) {
                this.selectionConvocadas.select(row)
            }
        });
    };

    selectedRow = (row) => {
        this.selectionConvocadas.toggle(row)
        if (this.isSeleccionadoTodos) {
            const exist = this.selectionConvocadas.selected.find(x => x.idPlazaRotacionDetalle == row.idPlazaRotacionDetalle);
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

    masterToggleConvocadas = () => {
        if (this.isSeleccionadoTodos == true)
            this.isSeleccionadoTodos = false;
        else
            this.isSeleccionadoTodos = true;

        if (this.isSeleccionadoTodos) {
            this.selectionConvocadas.clear();
            this.noSeleccionados = [];
            this.dataSourceConvocadas.data.forEach(row => {
                this.selectionConvocadas.select(row)
            });
        } else {
            this.selectionConvocadas.clear();
            this.noSeleccionados = [];
        }

        this.changeTotalSeleccionados();
    };

    //No utilizar este metodo
    isAllSelectedConvocadas = (): boolean => {
        const numSelected = this.selectionConvocadas.selected.length;
        const numRows = this.dataSourceConvocadas.data.length;
        return numSelected === numRows;
    };

    //no se debe utilizar
    selectedGridConvocadas = (param) => {
        this.selectionConvocadas.toggle(param);
    };

    changeTotalSeleccionados = () => {
        if (this.isSeleccionadoTodos == true)
            this.totalSeleccionados = this.dataSourceConvocadas?.dataTotal - this.noSeleccionados?.length;
        else
            this.totalSeleccionados = this.selectionConvocadas?.selected?.length;
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
            this.selectionConvocadas.clear();
        });
    }

    private getDataConvocadasTodos = async () => {
        this.setRequest();
        return new Promise<{ success: boolean; data: [] }>(async resolve => {
            return this.dataService.Rotacion()
                .getGridPlazaRotacionConvocadas(this.request, 1, 20000000)
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

    handleObservarPlazasConvocadas = async () => {
        let plazasConvocadas: any[] = [];
        if (this.isSeleccionadoTodos) {
            const resultDataTodos = await this.getDataConvocadasTodos();
            const data: any[] = resultDataTodos.data;

            if (this.noSeleccionados.length == 0) {
                plazasConvocadas = data;
            } else {
                data.forEach(plaza => {
                    const exist = this.noSeleccionados.find(x => x.idPlazaRotacionDetalle == plaza.idPlazaRotacionDetalle);
                    if (exist == null) {
                        plazasConvocadas.push(plaza);
                    }
                });
            }
        } else {
            plazasConvocadas = this.selectionConvocadas.selected;
        }

        if (plazasConvocadas.length === 0) {
            this.dataService.Message().msgWarning('Seleccione al menos un registro para proceder con la operación.', () => { });
            return;
        }
        const plazasRotacionDetalle = plazasConvocadas.map(t => { return t.idPlazaRotacionDetalle });
        const data = {
            plazasRotacionDetalle: plazasRotacionDetalle,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idEtapaProceso: this.proceso.idEtapaProceso,
            idPlazaRotacion: this.plazaRotacion.idPlazaRotacion,
            prepublicadas: false,
            seleccionadoTodos: this.isAllSelectedConvocadas()
        };

        this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA OBSERVAR LAS PLAZAS?", () => {
            this.dialogRef = this.materialDialog.open(SustentoMotivoNoPublicacionPlazaComponent,
                {
                    panelClass: 'sustento-motivo-no-publicacion',
                    disableClose: true,
                    data: data,
                }
            );

            this.dialogRef.afterClosed().subscribe((resp) => {
                if (resp != null) {
                    this.getDataGridConvocadas();
                    this.masterToggleConvocadas();
                    this.selectionConvocadas.clear();
                }
            });

        }, () => { });
    };

    handleExportarPlazasConvocadas = () => {
        if (this.dataSourceConvocadas.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    'No se encontró información para exportar.',
                    () => {
                    }
                );
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .exportarPlazaRotacionConvocadas(this.request)
            .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'plazas convocadas.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'No se encontró información para los criterios de búsqueda ingresado',
                            () => {
                            }
                        );
                }
            });
    };

    private setRequest = () => {
        this.request = {
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value,
        };
    };
    configCatch(e: any) {
        if (e && e.status === 400 && isArray(e.messages)) {
            this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if (isArray(e.messages)) {
            if ((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD") != -1)
                this.dataService.Util().msgError(e.messages[0], () => { });
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { });

        } else {
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e)
    }
}


export class ConvocadasDataSource extends DataSource<any> {
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
                .getGridPlazaRotacionConvocadas(data, pageIndex, pageSize)
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
            this.dataService.Message().msgWarning('No se encontró información de plazas convocadas para los criterios de búsqueda ingresados.', () => {
            });
        } else {
            this.dataService.Message().msgWarning('Ocurrieron problemas al momento de buscar plazas convocadas para los criterios de búsqueda ingresados.', () => { });
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
    configCatch(e: any) {
        if (e && e.status === 400 && isArray(e.messages)) {
            this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if (isArray(e.messages)) {
            if ((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD") != -1)
                this.dataService.Util().msgError(e.messages[0], () => { });
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { });

        } else {
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e)
    }
}