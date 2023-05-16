import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
import { IncorporarPlazasComponent } from './incorporar-plazas/incorporar-plazas.component';

@Component({
    selector: 'minedu-bandeja-plazas-prepublicadas',
    templateUrl: './bandeja-plazas-prepublicadas.component.html',
    styleUrls: ['./bandeja-plazas-prepublicadas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPlazasPrepublicadasComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input()
    form: FormGroup;
    @Input() btnBuscar: Observable<void>;
    @Output() rowCountEvent: EventEmitter<any> = new EventEmitter();
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
    * VARIABLES PLAZAS PREPUBLICADAS
    *-------------------------------------------------------------------------------------------------------------
    */
    dataSourcePrepublicadas: PrepublicadasDataSource | null;
    selectionPrepublicadas = new SelectionModel<any>(true, []);
    noSeleccionados: any[] = [];
    @ViewChild('paginatorPrepublicadas', { static: true }) paginatorPrepublicadas: MatPaginator;

    private _unsubscribeAll: Subject<any>;
    constructor(
        private activeRoute: ActivatedRoute,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService,
        private router: Router
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
            
        this.btnBuscarSubscription = this.btnBuscar.subscribe(() => this.getDataGridPrepublicadas());
    }

    private buildGrid() {
        this.dataSourcePrepublicadas = new PrepublicadasDataSource(this.dataService, this.sharedService);
        this.buildPaginators(this.paginatorPrepublicadas);
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
        this.paginatorPrepublicadas.page.subscribe(() => {
            this.getDataGridPrepublicadas()
        });
        setTimeout(() => { this.dataService.Spinner().show('sp6'); this.getDataGridPrepublicadas(); }, 0);
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
        * OPERACIONES PLAZAS PRE PUBLICADAS
        *-------------------------------------------------------------------------------------------------------------
        */
    private getDataGridPrepublicadas = async () => {
        this.setRequest();
        const data = await this.dataSourcePrepublicadas.load(
            this.request,
            this.paginatorPrepublicadas.pageIndex + 1,
            this.paginatorPrepublicadas.pageSize
        );
        if (this.isSeleccionadoTodos) {
            this.masterTogglePrepublicadasNavigacion();
        }
    };

    masterTogglePrepublicadasNavigacion = () => {
        this.selectionPrepublicadas.clear();
        this.dataSourcePrepublicadas.data.forEach(row => {
            const exist = this.noSeleccionados.find(x => x.idPlazaRotacionDetalle == row.idPlazaRotacionDetalle);
            if (exist == null) {
                this.selectionPrepublicadas.select(row)
            }
        });
    };

    selectedRow = (row) => {
        this.selectionPrepublicadas.toggle(row)
        if (this.isSeleccionadoTodos) {
            const exist = this.selectionPrepublicadas.selected.find(x => x.idPlazaRotacionDetalle == row.idPlazaRotacionDetalle);
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

    masterTogglePrepublicadas = () => {
        if (this.isSeleccionadoTodos == true)
            this.isSeleccionadoTodos = false;
        else
            this.isSeleccionadoTodos = true;

        if (this.isSeleccionadoTodos) {
            this.selectionPrepublicadas.clear();
            this.noSeleccionados = [];
            this.dataSourcePrepublicadas.data.forEach(row => {
                this.selectionPrepublicadas.select(row)
            });
        } else {
            this.selectionPrepublicadas.clear();
            this.noSeleccionados = [];
        }

        this.changeTotalSeleccionados();
    };

    // No se utiliza este método
    isAllSelectedPrepublicadas = (): boolean => {
        const numSelected = this.selectionPrepublicadas.selected.length;
        const numRows = this.dataSourcePrepublicadas.data.length;
        return numSelected === numRows;
    };

    // No se utiliza este método
    selectedGridPrepublicadas = (param) => {
        this.selectionPrepublicadas.toggle(param);
    };

    changeTotalSeleccionados = () => {
        if (this.isSeleccionadoTodos == true)
            this.totalSeleccionados = this.dataSourcePrepublicadas?.dataTotal - this.noSeleccionados?.length;
        else
            this.totalSeleccionados = this.selectionPrepublicadas?.selected?.length;
    }

    handleIncorporarPlazas = () => {
        this.dialogRef = this.materialDialog.open(
            IncorporarPlazasComponent,
            {
                panelClass: 'incorporar-plazas',
                width: '1300px',
                disableClose: true,
                data: {
                    idPlazaRotacion: this.plazaRotacion == null ? 0 : this.plazaRotacion.idPlazaRotacion,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response) => {
            if (!response) {
                return;
            }
            this.getDataGridPrepublicadas();
            this.masterTogglePrepublicadas();
            this.selectionPrepublicadas.clear();
        });
    }

    handleGoIncorporarPlazas = (row) => {
        let plazaRotacion = this.plazaRotacion == null ? 0 : this.plazaRotacion.idPlazaRotacion;
        let idDesarrolloProceso = this.proceso.idDesarrolloProceso;
        let idEtapaProceso = this.proceso.idEtapaProceso;
        this.router.navigate(
            [
                "../../../incorporarPlazas/" +
                    plazaRotacion +
                    "/" +
                    idDesarrolloProceso +                   
                    "/" + 
                    idEtapaProceso,
            ],
            { relativeTo: this.activeRoute }
        );         
    }

    private getDataPrepublicadasTodos = async () => {
        this.setRequest();
        return new Promise<{ success: boolean; data: [] }>(async resolve => {
            return this.dataService.Rotacion()
                .getGridPlazaRotacionPrepublicadas(this.request, 1, 20000000)
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

    handleConvocarPlazasPrepublicadas = async () => {
        let plazasPrepublicadas: any[] = [];
        if (this.isSeleccionadoTodos) {
            const resultDataPrepublicadasTodos = await this.getDataPrepublicadasTodos();
            const data: any[] = resultDataPrepublicadasTodos.data;
            if (this.noSeleccionados.length == 0) {
                plazasPrepublicadas = data;
            } else {
                data.forEach(prepublicada => {
                    const exist = this.noSeleccionados.find(x => x.idPlazaRotacionDetalle == prepublicada.idPlazaRotacionDetalle);
                    if (exist == null) {
                        plazasPrepublicadas.push(prepublicada);
                    }
                });
            }
        } else {
            plazasPrepublicadas = this.selectionPrepublicadas.selected;
        }

        if (plazasPrepublicadas.length === 0) {
            this.dataService.Message().msgWarning('"SELECCIONE AL MENOS UN REGISTRO PARA PROCEDER CON LA OPERACIÓN."', () => { });
            return;
        }

        const plazasRotacionDetalle = plazasPrepublicadas.map(t => { return t.idPlazaRotacionDetalle });
        const data = {
            plazasRotacionDetalle: plazasRotacionDetalle,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            
            idPlazaRotacion: this.plazaRotacion.idPlazaRotacion
        };

        this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA CONVOCAR LAS PLAZAS?", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Rotacion()
                .enviarPlazasPrepublicadasToConvocadas(data)
                .pipe(
                    catchError((e) => { return this.configCatch(e); }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.getDataGridPrepublicadas();
                        this.masterTogglePrepublicadas();
                        this.selectionPrepublicadas.clear();
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"LAS PLAZAS SELECCIONADAS SE ENVIARON CORRECTAMENTE A PLAZAS CONVOCADAS."', 3000, () => { });
                    } else {
                        this.dataService.Message().msgWarning('"ERROR AL ENVIAR LAS PLAZAS PREPUBLICADAS A CONVOCADAS"', () => { });
                    }
                });

        }, () => { });
    };

    handleObservarPlazasPrepublicadas = async () => {
        let plazasPrepublicadas: any[] = [];
        if (this.isSeleccionadoTodos) {
            const resultDataPrepublicadasTodos = await this.getDataPrepublicadasTodos();
            const data: any[] = resultDataPrepublicadasTodos.data;

            if (this.noSeleccionados.length == 0) {
                plazasPrepublicadas = data;
            } else {
                data.forEach(prepublicada => {
                    const exist = this.noSeleccionados.find(x => x.idPlazaRotacionDetalle == prepublicada.idPlazaRotacionDetalle);
                    if (exist == null) {
                        plazasPrepublicadas.push(prepublicada);
                    }
                });
            }
        } else {
            plazasPrepublicadas = this.selectionPrepublicadas.selected;
        }

        if (plazasPrepublicadas.length === 0) {
            this.dataService.Message().msgWarning('"SELECCIONE AL MENOS UN REGISTRO PARA PROCEDER CON LA OPERACIÓN."', () => { });
            return;
        }
        const plazasRotacionDetalle = plazasPrepublicadas.map(t => { return t.idPlazaRotacionDetalle });
        const data = {
            plazasRotacionDetalle: plazasRotacionDetalle,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idPlazaRotacion: this.plazaRotacion.idPlazaRotacion,          
            prepublicadas: true
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
                    this.getDataGridPrepublicadas();
                    this.masterTogglePrepublicadas();
                    this.selectionPrepublicadas.clear();
                }
            });
        }, () => { });
    };

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
            this.selectionPrepublicadas.clear();
        });
    }

    handleEliminarPlaza = (row) => {
        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA ELIMINAR PLAZA INCORPORADA?", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Rotacion()
                .eliminarPlazaPrepublicada(row)
                .pipe(
                    catchError((e) => { return this.configCatch(e); }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton('"EL REGISTRO SE ELIMINÓ SATISFACTORIAMENTE."', 3000, () => { 
                            this.getDataGridPrepublicadas();
                            this.masterTogglePrepublicadas();
                            this.selectionPrepublicadas.clear();
                        });
                    } else {
                        this.dataService.Message().msgWarning('"ERROR AL ELIMINAR LA PLAZA PREPUBLICADA."', () => { });
                    }
                });

        }, () => { });
    }

    handleExportarPlazasPrepublicadas = () => {
        if (this.dataSourcePrepublicadas.data.length === 0) {
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
            .exportarPlazaRotacionPrepublicadas(this.request)
            .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'plazas prepublicadas.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"',
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
    private configCatch(e: any) {
        if (e && e.status === 400 && isArray(e.messages)) {
            this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if (isArray(e.messages)) {
            if ((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD") != -1)
                this.dataService.Util().msgError(e.messages[0], () => { });
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { });

        } else {
            this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e)
    }
}


export class PrepublicadasDataSource extends DataSource<any> {
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
                .getGridPlazaRotacionPrepublicadas(data, pageIndex, pageSize)
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
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE PLAZAS PREPUBLICADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {
            });
        } else {
            this.dataService.Message().msgWarning('"OCURRIERON PROBLEMAS AL MOMENTO DE BUSCAR PLAZAS PREPUBLICADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
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
            if ((e.messages[0]).indexOf('"HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD"') != -1)
                this.dataService.Util().msgError(e.messages[0], () => { });
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { });

        } else {
            this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e)
    }
}