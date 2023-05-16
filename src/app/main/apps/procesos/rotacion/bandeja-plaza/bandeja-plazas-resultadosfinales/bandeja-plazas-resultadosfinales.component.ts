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
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { InformacionPlazaRotacionComponent } from '../../components/informacion-plaza-rotacion/informacion-plaza-rotacion.component';
import {TablaEstadosDesarrolloProceso, EstadoResultadoFinal, EstadoCuadroResultadoFinal} from '../../_utils/constants';

@Component({
    selector: 'minedu-bandeja-plazas-resultadosfinales',
    templateUrl: './bandeja-plazas-resultadosfinales.component.html',
    styleUrls: ['./bandeja-plazas-resultadosfinales.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPlazasResultadosfinalesComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input()
    form: FormGroup;
    @Input() btnBuscar: Observable<void>;
    private btnBuscarSubscription: Subscription;

    proceso: RotacionModel;
    plazaRotacion: any = null;
    dialogRef: any;
    working = false;
    mostrarFecha: boolean = false;
    estadoProcesoRotacion = TablaEstadosDesarrolloProceso;
    estadoResultadoFinal = EstadoResultadoFinal;
    estadoCuadroResultadoFinal = EstadoCuadroResultadoFinal;

    displayedColumnsPlazas: string[] = [
        'registro',
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
        'estadoResultadoFinal',
        'acciones',
    ];
    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    request = {
        idDesarrolloProceso: null,
        idEstadoResultadoFinal: null,
        codigoPlaza: null,
        codigoCentroTrabajo: null,
    };


    /*
      *-------------------------------------------------------------------------------------------------------------
      * VARIABLES RESULTADO FINAL
      *-------------------------------------------------------------------------------------------------------------
      */
    dataSourceResultadoFinal: ResultadosFinalesDataSource | null;
    selectionResultadoFinal = new SelectionModel<any>(true, []);
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
           
        this.btnBuscarSubscription = this.btnBuscar.subscribe(() => this.getDataGridResultadosFinales());
        
        this.mostrarFechaPublicacion();
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
        this.sharedService.setSharedBreadcrumb('Procesos de rotación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de rotación');
    }

    /*
       *-------------------------------------------------------------------------------------------------------------
       * OPERACIONES RESULTADO FINAL
       *-------------------------------------------------------------------------------------------------------------
       */
    private getDataGridResultadosFinales = () => {
        this.setRequest();
        this.dataSourceResultadoFinal.load(
            this.request,
            this.paginatorResultadoFinal.pageIndex + 1,
            this.paginatorResultadoFinal.pageSize
        );
    };
    mostrarFechaPublicacion = () => {
        if(this.plazaRotacion.fechaPublicacion !== null) {
            this.mostrarFecha = true;
        }
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
            this.selectionResultadoFinal.clear();
        });
    }

    handleExportarPlazasResultadoFinal = () => {
        if (this.dataSourceResultadoFinal.data.length === 0) {
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
            .exportarPlazaRotacionResultadoFinal(this.request)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'plazas resultados finales.xlsx');
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
            idEstadoResultadoFinal: this.form.get('idEstadoResultadoFinal').value,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value,
        };
    };
    private configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}

export class ResultadosFinalesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this.dataService.Rotacion()
            .getGridPlazaRotacionResultadoFinal(data, pageIndex, pageSize)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
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
            });
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
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}