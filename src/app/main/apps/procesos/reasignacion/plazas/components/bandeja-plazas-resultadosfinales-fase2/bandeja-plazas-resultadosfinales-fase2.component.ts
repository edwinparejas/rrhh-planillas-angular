import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Component, Input, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { descargarExcel } from "app/core/utility/functions";
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import { catchError, filter, finalize, takeUntil } from "rxjs/operators";
import { ReasignacionesModel } from "../../../models/reasignaciones.model";
import { MENSAJES } from "../../../_utils/constants";
import { InformacionPlazaComponent } from '../informacion-plaza/informacion-plaza.component';
import { CodigoEstadoDesarrollo,codigoResultadoFinal } from 'app/core/model/types-reasignacion';
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
    selector: "minedu-bandeja-plazas-resultadosfinales-fase2",
    templateUrl: "./bandeja-plazas-resultadosfinales-fase2.component.html",
    styleUrls: ["./bandeja-plazas-resultadosfinales-fase2.component.scss"],    
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPlazasResultadosfinalesFase2Component implements OnInit {

    @Input() form: FormGroup;
    @Input() btnBuscar: Observable<void>;
    @Input() idEtapaProceso:any;
    @Input() selectedTabIndex: any; 
    @Output() onBuscar: EventEmitter<boolean>;
    private btnBuscarSubscription: Subscription;

    // proceso: ReasignacionesModel;
    idAlcanceProceso: number;
    plazaRotacion: any = null;
    dialogRef: any;
    working = false;
    isSeleccionadoTodos: boolean = false;
    totalSeleccionados: number = 0;

    displayedColumnsPlazas: string[] = [
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
        'estadoResultadoFinal',
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

    // Variables resultado final
    dataSourceResultadoFinal: ResultadosFinalesDataSource | null;
    selectionResultadoFinal = new SelectionModel<any>(true, []);
    noSeleccionados: any[] = [];
    @ViewChild('paginatorResultadoFinal', { static: true }) paginatorResultadoFinal: MatPaginator;

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
            ).subscribe(rotacion => this.plazaRotacion = rotacion);
        this.btnBuscarSubscription = this.btnBuscar.subscribe(() => this.getDataGridResultadosFinales());
    }

    private buildGrid() {
        this.dataSourceResultadoFinal = new ResultadosFinalesDataSource(this.dataService, this.sharedService);

        this.buildPaginators(this.paginatorResultadoFinal);
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
        this.paginatorResultadoFinal.page.subscribe(() => this.getDataGridResultadosFinales());
        setTimeout(() => { this.dataService.Spinner().show('sp6'); this.getDataGridResultadosFinales(); }, 0);
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

    claseSegunEstado = (codigoEstado: number) => {
        let clase = '';

        switch (codigoEstado) {
            case codigoResultadoFinal.Pendiente:
                clase = 'badge-warning';
                break;

            case codigoResultadoFinal.Adjudicado:
                clase = 'badge-success';
                break;

            case codigoResultadoFinal.Desierto:
                clase = 'badge-danger';
                break;

            default:
                clase = 'badge-default';
                break;
        }

        return clase;
    }

    // operaciones resultado final
    private getDataGridResultadosFinales = () => {
        this.setRequest();
        this.dataSourceResultadoFinal.load(
            this.request,
            this.paginatorResultadoFinal.pageIndex + 1,
            this.paginatorResultadoFinal.pageSize,
            this.selectedTabIndex 
        );
        if (this.isSeleccionadoTodos) {
            this.masterToggleResultadosFinalesNavigacion();
        }
    };
    
    masterToggleResultadosFinalesNavigacion = () => {
        this.selectionResultadoFinal.clear();
        this.dataSourceResultadoFinal.data.forEach(row => {
            const exist = this.noSeleccionados.find(x => x.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
            if (exist == null) {
                this.selectionResultadoFinal.select(row)
            }
        });
    };

    selectedRow = (row) => {
        this.selectionResultadoFinal.toggle(row)
        if (this.isSeleccionadoTodos) {
            const exist = this.selectionResultadoFinal.selected.find(x => x.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
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
            this.totalSeleccionados = this.dataSourceResultadoFinal?.dataTotal - this.noSeleccionados?.length;
        else
            this.totalSeleccionados = this.selectionResultadoFinal?.selected?.length;
    }

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
            this.selectionResultadoFinal.clear();
        });
    }

    handleExportarPlazasResultadoFinal = () => {
        if (this.dataSourceResultadoFinal.data.length === 0) {
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
            .exportarPlazaReasignacionResultadoFinalFase2(this.request)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'plazas_resultados_finales.xlsx');
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
            idEtapaProceso: +this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value,
        };
    }; 
}

export class ResultadosFinalesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    load(data: any, pageIndex, pageSize, selectedTabIndex: number): void {
        this.dataService.Reasignaciones()
            .getGridPlazaReasignacionResultadoFinalFase2(data, pageIndex, pageSize)
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
                    const { rotacion, rows } = response;
                    this.sharedService.sendRotacionData(rotacion);
                    if (rows.length == 0) {
                        this.gridResultMessage(selectedTabIndex);
                    } else {
                        this.totalregistro = (rows || []).length === 0 ? 0 : rows[0].totalRegistros;
                        this._dataChange.next(rows || []);
                    }
                } else {
                    this.gridResultMessage(selectedTabIndex,false);
                }
            });
    }

    private gridResultMessage = (selectedTabIndex: number, emptyResult: boolean = true) => {
        this.totalregistro = 0;
        this._dataChange.next([]);
        if (emptyResult) {
            if(selectedTabIndex == 2){
                this.dataService.Message()
                .msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE RESULTADOS FINALES PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {
                });
            }
        } else {
            this.dataService.Message()
            .msgWarning('"OCURRIERON PROBLEMAS AL MOMENTO DE BUSCAR RESULTADOS FINALES PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
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