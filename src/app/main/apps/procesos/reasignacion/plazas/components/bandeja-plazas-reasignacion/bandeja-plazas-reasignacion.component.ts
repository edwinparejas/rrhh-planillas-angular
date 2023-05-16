import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter  } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { isArray } from 'lodash';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { ReasignacionesModel } from '../../../models/reasignaciones.model';
import { MENSAJES } from '../../../_utils/constants';
import { InformacionPlazaComponent } from '../informacion-plaza/informacion-plaza.component';
import { SustentoMotivoNoPublicacionPlazaComponent } from '../sustento-motivo-no-publicacion-plaza/sustento-motivo-no-publicacion-plaza.component';
const dutchRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length == 0 || pageSize == 0) { return `0 de ${length}`; }   
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
  
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
  
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }

@Component({
  selector: 'minedu-bandeja-plazas-reasignacion',
  templateUrl: './bandeja-plazas-reasignacion.component.html',
  styleUrls: ['./bandeja-plazas-reasignacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaPlazasReasignacionComponent implements OnInit, OnDestroy, AfterViewInit {
  
    @Input() form: FormGroup;
    @Input() btnBuscar: Observable<void>;  
    @Input() idEtapaProceso:any;
    @Input() procesoOrigen: ReasignacionesModel;
    @Input() reasignacion: any;
    @Input() selectedTabIndex: any; 
    @Output() onBuscar: EventEmitter<boolean>;
    private btnBuscarSubscription: Subscription;
    idAlcanceProceso: number;
    // proceso: ReasignacionesModel;
    plazaReasignacion: any = null;
    dialogRef: any;
    working = false;
    isSeleccionadoTodos: boolean = false;
    totalSeleccionados: number = 0;

    displayedColumnsPlazas: string[] = [
        // 'select',
        'registro',
        'codigoModular',
        'centroTrabajo',
        'modalidad',
        'nivelEducativo',
        'tipoGestion',
        'codigoPlaza',
        'cargo',
        'areaCurricular',
        'tipoPlaza',
        'fechaVigenciaInicio',
        'fechaVigenciaFin',
        'acciones',
    ];
    paginatorPageSize = 10;
    paginatorPageIndex = 0;


    request = {
        idEtapaProceso: null,
        idAlcanceProceso: null,
        codigoPlaza: null,
        codigoCentroTrabajo: null,
    };

    // variables plazas reasignacion
    dataSourcePrepublicadas: PrepublicadasDataSource | null;
    selectionPrepublicadas = new SelectionModel<any>(true, []);
    noSeleccionados: any[] = [];
    @ViewChild('paginatorPrepublicadas', { static: true }) paginatorPrepublicadas: MatPaginator;
    private _unsubscribeAll: Subject<any>;

    constructor(
        private activeRoute: ActivatedRoute,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) { 
        this._unsubscribeAll = new Subject();
        this.onBuscar = new EventEmitter<boolean>();
    }

    ngOnInit(): void {
        this.idAlcanceProceso = parseInt(this.activeRoute.snapshot.params.paramIdAlcanceProceso);
        setTimeout((_) => this.buildShared());
        this.activeRoute.data.subscribe((data) => {
            if (data) {
                // this.proceso = data.ProcesoEtapa;
                this.buildGrid();
            }
        });
        this.sharedService.onDataSharedRotacion
            .pipe(
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(reasignacion => this.plazaReasignacion = reasignacion);

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
        paginator._intl.getRangeLabel = dutchRangeLabel;
    }

    ngAfterViewInit(): void {
        this.paginatorPrepublicadas.page.subscribe(() => this.getDataGridPrepublicadas());
        setTimeout(() => { this.dataService.Spinner().show('sp6'); this.getDataGridPrepublicadas(); }, 0);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.btnBuscarSubscription.unsubscribe();
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb('Procesos de reasignación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de reasignación');
    }


    // ***************  * OPERACIONES PLAZAS PRE PUBLICADAS

    private getDataGridPrepublicadas = () => {
        this.setRequest();
        this.dataSourcePrepublicadas.load(
            this.request,
            this.paginatorPrepublicadas.pageIndex + 1,
            this.paginatorPrepublicadas.pageSize,
            this.selectedTabIndex
        );
        if (this.isSeleccionadoTodos) {
            this.masterTogglePrepublicadasNavigacion();
        }
    };

    masterTogglePrepublicadasNavigacion = () => {
        this.selectionPrepublicadas.clear();
        this.dataSourcePrepublicadas.data.forEach(row => {
            const exist = this.noSeleccionados.find(x => x.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
            if (exist == null) {
                this.selectionPrepublicadas.select(row)
            }
        });
    };

    selectedRow = (row) => {
        this.selectionPrepublicadas.toggle(row)
        if (this.isSeleccionadoTodos) {
            const exist = this.selectionPrepublicadas.selected.find(x => x.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
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
            const exist = this.noSeleccionados.find(x => x.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
            if (exist == null) {
                this.noSeleccionados.push(row);
            }
        } else {
            const seleccionados = Object.assign([], this.noSeleccionados);
            this.noSeleccionados = [];
            seleccionados.forEach(element => {
                if (element.idPlazaReasignacionDetalle != row.idPlazaReasignacionDetalle) {
                    this.noSeleccionados.push(row);
                }
            });
        }
    }
    
    changeTotalSeleccionados = () => {

        if (this.isSeleccionadoTodos == true)
            this.totalSeleccionados = this.dataSourcePrepublicadas?.dataTotal - this.noSeleccionados?.length;
        else
            this.totalSeleccionados = this.selectionPrepublicadas?.selected?.length;
    }

    private getDataPrepublicadasTodos = async () => {
        this.setRequest();
        return new Promise<{ success: boolean; data: [] }>(async resolve => {
            return this.dataService.Reasignaciones()
                .getGridPlazaReasignacionPrepublicadas(this.request, 1, 20000000)
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

    handleMigrarPlazasEtapaAnterior = () => {
        const data = {
            idEtapaProceso: +this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso,
            codigoEtapa: this.procesoOrigen?.codigoEtapaFase,
            // codigoSede: this.dataService.Storage().getInformacionUsuario().codigoSede,
            usuarioCreacion: this.dataService.Storage().getInformacionUsuario().numeroDocumento,
        };
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA MIGRAR LAS PLAZAS DE LA ETAPA ANTERIOR? </b>", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .migrarPlazasEtapaAnterior(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        if(response>0){
                            // this.getDataGridPrepublicadas();
                            this.onBuscar.emit(true);
                            this.masterTogglePrepublicadas();
                            this.selectionPrepublicadas.clear();
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                        }
                    } else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD, () => { });
                    }
                });
        }, () => { });
    }

    handleConvocarPlazasPrepublicadas = async () => {

        let plazasPrepublicadas: any[] = [];
        if (this.isSeleccionadoTodos) { 
            const resultDataPrepublicadasTodos = await this.getDataPrepublicadasTodos();
            const data: any[] = resultDataPrepublicadasTodos.data;
            // console.log("plazasa convocar",data);
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
        // const plazasPrepublicadas: any[] = this.selectionPrepublicadas.selected;
        if (plazasPrepublicadas.length === 0) {
            this.dataService.Message()
            .msgWarning(MENSAJES.MENSAJE_SELECCIONAR_MINIMO_UN_REGISTRO, () => { });
            return;
        }

        const plazasReasignacionDetalle = plazasPrepublicadas.map(t => { return t.idPlazaReasignacionDetalle });  

        const data = {
            plazasReasignacionDetalle: plazasReasignacionDetalle,
            idEtapaProceso:this.idEtapaProceso,
            idPlazaReasignacion: plazasPrepublicadas[0].idPlazaReasignacion,
        };
        
        this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA CONVOCAR LAS PLAZAS SELECCIONADAS?", () => { //M75
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .enviarPlazasPrepublicadasToConvocadas(data)
                .pipe(
                    catchError((e) => of(null)),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        // this.getDataGridPrepublicadas();
                        this.onBuscar.emit(true);
                        this.masterTogglePrepublicadas();
                        this.selectionPrepublicadas.clear();
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                    } else {
                        this.dataService.Message().msgError('ERROR AL ENVIAR LAS PLAZAS PREPUBLICADAS A CONVOCADAS.', () => { });
                    }
                });

        }, () => { });
    };

    masterTogglePrepublicadas = () => {
        this.isAllSelectedPrepublicadas() ?
            this.selectionPrepublicadas.clear() :
            this.dataSourcePrepublicadas.data.forEach(row => this.selectionPrepublicadas.select(row));
    };

    isAllSelectedPrepublicadas = (): boolean => {
        const numSelected = this.selectionPrepublicadas.selected.length;
        const numRows = this.dataSourcePrepublicadas.data.length;
        return numSelected === numRows;
    };

    selectedGridPrepublicadas = (param) => {
        this.selectionPrepublicadas.toggle(param);
    };

    handleObservarPlazasPrepublicadas = () => {
        const plazasPrepublicadas: any[] = this.selectionPrepublicadas.selected;

        if (plazasPrepublicadas.length === 0) {
            this.dataService.Message()
            .msgWarning(MENSAJES.MENSAJE_SELECCIONAR_MINIMO_UN_REGISTRO, () => { });
            return;
        }
        const plazasReasignacionDetalle = plazasPrepublicadas.map(t => { return t.idPlazaReasignacionDetalle });
        const data = {
            plazasReasignacionDetalle: plazasReasignacionDetalle,
            idEtapaProceso:this.idEtapaProceso,
            idPlazaReasignacion: plazasPrepublicadas[0].idPlazaReasignacion,
            prepublicadas: true
        };
        this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA OBSERVAR LAS PLAZAS SELECCIONADAS?", () => {  //M30
            this.dialogRef = this.materialDialog.open(SustentoMotivoNoPublicacionPlazaComponent,
                {
                    panelClass: 'sustento-motivo-no-publicacion',
                    disableClose: true,
                    data: data,
                }
            );

            this.dialogRef.afterClosed().subscribe((resp) => {
                if (resp != null) {
                    // this.getDataGridPrepublicadas();
                    this.onBuscar.emit(true);
                    this.masterTogglePrepublicadas();
                    this.selectionPrepublicadas.clear();
                }
            });
        }, () => { });
    };

    handleVerInformacionPlaza = (row) => {
        this.dialogRef = this.materialDialog.open(InformacionPlazaComponent,
            {
                panelClass: 'informacion-plaza',
                disableClose: true,
                data: {
                    idPlazaReasignacion: row.idPlazaReasignacion,
                    idPlazaReasignacionDetalle: row.idPlazaReasignacionDetalle,
                    idPlaza: Number(row.idPlaza)
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            this.selectionPrepublicadas.clear();
        });
    }

    handleExportarPlazasReasignacion = () => {
        if (this.dataSourcePrepublicadas.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_PARA_EXPORTAR,
                    () => {}
                );
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .exportarPlazaReasignacionPrepublicadas(this.request)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'plazas_reasignacion.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,
                            () => {}
                        );
                }
            });
    };

    private setRequest = () => {
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso,
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
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
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

    load(data: any, pageIndex, pageSize, selectedTabIndex: number): void {
        this.dataService.Reasignaciones()
            .getGridPlazaReasignacion(data, pageIndex, pageSize)
            .pipe(
                catchError(() => of(null)),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide('sp6');
                    this.sharedService.sendWorking(false);
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    const { reasignacion, rows } = response;
                    this.sharedService.sendRotacionData(reasignacion); 
                    if (rows.length == 0) {
                        this.gridResultMessage(selectedTabIndex);
                    } else {
                        this.totalregistro = (rows || []).length === 0 ? 0 : rows[0].totalRegistros;
                        this._dataChange.next(rows || []);
                    }
                } else {
                    this.gridResultMessage(selectedTabIndex, false);
                }
            });
    }

    private gridResultMessage = (selectedTabIndex: number, emptyResult: boolean = true) => {
        this.totalregistro = 0;
        this._dataChange.next([]);
        if (emptyResult) {
            if(selectedTabIndex == 0){
                this.dataService.Message()
                .msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE PLAZAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {});
            }
        } else {
            this.dataService.Message()
            .msgWarning('"OCURRIERON PROBLEMAS AL MOMENTO DE BUSCAR PLAZAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
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
}