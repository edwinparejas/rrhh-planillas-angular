import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { MENSAJES } from '../../../_utils/constants';
import { mineduAnimations } from '@minedu/animations/animations';
import { SecurityModel } from 'app/core/model/security/security.model';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { ReasignacionesModel } from '../../../models/reasignaciones.model';
import { InformacionPlazaComponent } from '../../../plazas/components/informacion-plaza/informacion-plaza.component';
import { IncorporarPlazasComponent } from '../../../components/incorporar-plazas/incorporar-plazas.component';
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
  selector: 'minedu-plazas-reasignacion-prepublicacion',
  templateUrl: './plazas-reasignacion-prepublicacion.component.html',
  styleUrls: ['./plazas-reasignacion-prepublicacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class PlazasReasignacionPrepublicacionComponent implements OnInit, OnDestroy, AfterViewInit {
  
    @Input() form: FormGroup;
    @Input() btnBuscar: Observable<void>;    
    @Input() procesoOrigen: ReasignacionesModel;
    @Input() reasignacion: any;
    @Output() onBuscar: EventEmitter<boolean>;
    @Input() selectedTabIndex: any;
    private btnBuscarSubscription: Subscription;
    currentSession: SecurityModel = new SecurityModel();
    idEtapaProceso: number;
    idAlcanceProceso: number;
    proceso: ReasignacionesModel;
    plazaReasignacion: any = null;
    dialogRef: any;
    working = false;
    isSeleccionadoTodos: boolean = false;
    totalSeleccionados: number = 0;

    displayedColumnsPlazas: string[] = [
        'registro',
        'instancia',
        'subinstancia',
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
        idInstancia: null,
        idSubInstancia: null
    };

    // variables plazas prepublicadas
    dataSourcePrepublicadas: PrepublicadasDataSource | null;
    selectionPrepublicadas = new SelectionModel<any>(true, []);
    // noSeleccionados: any[] = [];
    filaSeleccionadas:any[]=[];
    filaNoSeleccionadas:any[]=[];

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
        this.idEtapaProceso = parseInt(this.activeRoute.snapshot.params.paramIdEtapaProceso);
        this.idAlcanceProceso = parseInt(this.activeRoute.snapshot.params.paramIdAlcanceProceso);
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
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
        // if (this.isSeleccionadoTodos) {
        //     this.masterTogglePrepublicadasNavigacion();
        // }
    };

    // masterTogglePrepublicadasNavigacion = () => {
    //     this.selectionPrepublicadas.clear();
    //     this.dataSourcePrepublicadas.data.forEach(row => {
    //         const exist = this.noSeleccionados.find(x => x.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
    //         if (exist == null) {
    //             this.selectionPrepublicadas.select(row)
    //         }
    //     });
    // };

    selectedRow = (row) => {
        this.selectionPrepublicadas.toggle(row)
        if (this.isSeleccionadoTodos) {
            const exist = this.selectionPrepublicadas.selected.find(x => x.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
            // if (exist == null) {
            //     this.agregarNoSeleccionados(row, true);
            // } else {
            //     this.agregarNoSeleccionados(row, false);
            // }
        }

        // this.changeTotalSeleccionados();
    };

    // agregarNoSeleccionados = (row, estado: boolean) => {
    //     if (estado) {
    //         const exist = this.noSeleccionados.find(x => x.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
    //         if (exist == null) {
    //             this.noSeleccionados.push(row);
    //         }
    //     } else {
    //         const seleccionados = Object.assign([], this.noSeleccionados);
    //         this.noSeleccionados = [];
    //         seleccionados.forEach(element => {
    //             if (element.idPlazaReasignacionDetalle != row.idPlazaReasignacionDetalle) {
    //                 this.noSeleccionados.push(row);
    //             }
    //         });
    //     }
    // }

    
    // changeTotalSeleccionados = () => {

    //     if (this.isSeleccionadoTodos == true)
    //         this.totalSeleccionados = this.dataSourcePrepublicadas?.dataTotal - this.noSeleccionados?.length;
    //     else
    //         this.totalSeleccionados = this.selectionPrepublicadas?.selected?.length;
    // }

    // changeTotalSeleccionados = () => {

    //     console.log("this.noSeleccionados     ", this.noSeleccionados);

    //     if (this.isSeleccionadoTodos == true)
    //         this.totalSeleccionados = this.dataSourcePrepublicadas?.dataTotal- this.noSeleccionados?.length;
    //     else
    //         this.totalSeleccionados = this.selectionPrepublicadas?.selected?.length;
    //     console.log("this.totalSeleccionados     ", this.totalSeleccionados);

    // }

    dialogRegistrarPlaza(): void {
        this.dialogRef = this.materialDialog.open(IncorporarPlazasComponent, {
          panelClass: 'minedu-incorporar-plazas-dialog',
          width: '80%',
          disableClose: true,
          data: {
            action: 'busqueda',
            idep: (this.idEtapaProceso),
            idDesarrolloProceso: Number(this.idEtapaProceso)  
          },
        });
        this.dialogRef.afterClosed().subscribe((response) => {
          if (response === 'guardado') {
            this.getDataGridPrepublicadas();
            // this.masterTogglePrepublicadas();
            this.selectionPrepublicadas.clear();
            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION,() => {});
          }
        });
    }
    
    handleObservar(): void {

        let plazasSeleccionadas = [];
        let plazasNoSeleccionadas = [];
        let observarPlaza: any = this.selectionPrepublicadas.selected;
    
        if (observarPlaza.length === 0 && !this.isSeleccionadoTodos) {
          this.dataService.Message()
            .msgWarning(MENSAJES.MENSAJE_SELECCIONAR_MINIMO_UN_REGISTRO, () => { });
          return;
        }

        //Plazas seleccionadas
        for (let i = 0; i < observarPlaza.length; i++) {
            plazasSeleccionadas.push(observarPlaza[i].idPlazaReasignacionDetalle);
        }
        //Plazas No seleccionadas
        for (let i = 0; i < this.filaNoSeleccionadas.length; i++) {
            plazasNoSeleccionadas.push(this.filaNoSeleccionadas[i].idPlazaReasignacionDetalle);
        }
    
        const data = {
          idsPlazasReasignacionDetalle: plazasSeleccionadas,
          usuario: this.currentSession.numeroDocumento,
          idPlazaReasignacion: this.plazaReasignacion.idPlazaReasignacion,
          isSeleccionadoTodos: this.isSeleccionadoTodos,
          plazasNoSeleccionadas: plazasNoSeleccionadas
        }
        this.dataService.Message().msgConfirm(MENSAJES.MENSAJE_CONFIRMACION_TRASLADAR_PLAZAS_A_OBSERVADAS, //M91
        () => {
        this.dataService.Reasignaciones()
        .observarPlazas(data)
          .pipe(
            catchError(() => of([])),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
             })
          )
          .subscribe((Response: any) => {
            if (Response.length > 0) {
                this.dataService
                .Message()
                .msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE OBSERVAR LA(S) PLAZA(S)."', () => {});
              return
            }
            else {
                // this.getDataGridPrepublicadas();
                this.onBuscar.emit(true);
                // this.masterTogglePrepublicadas();
                this.filaSeleccionadas= [];
                this.filaNoSeleccionadas = [];
                this.isSeleccionadoTodos = false;
                this.selectionPrepublicadas.clear();
                this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO,MENSAJES.DURACION, () => {});
            }
          });
        });
    }

    handleEliminarPlazaIncorporada(row, i){
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA ELIMINAR LA PLAZA INCORPORADA?',
            () => {
                this.dataService.Spinner().show("sp6");
                let request: any =
                {
                    idPlazaReasignacionDetalleIncorporada: row.idPlazaReasignacionDetalle,
                    codigoCentroTrabajoMaestro: this.currentSession.codigoSede,
                    codigoRolPassport: this.currentSession.codigoRol,
                    idEtapaProceso: this.idEtapaProceso,
                    usuarioModificacion: this.currentSession.numeroDocumento,
                };
    
                this.dataService.Reasignaciones().eliminarPlazaIncorporada(request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((result) => {
                    if (result) {
                        this.getDataGridPrepublicadas();
                        // this.masterTogglePrepublicadas();
                        this.selectionPrepublicadas.clear();
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO,MENSAJES.DURACION,() => {});
                    } else {
                        this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE ELIMINAR LA PLAZA."',() => {});
                    }                    
                });  
                this.dataService.Spinner().hide("sp6");                
            }, (error) => {
                this.selectionPrepublicadas.clear();
            },
        );

    }

    // masterTogglePrepublicadas = () => {
    //     this.isAllSelectedPrepublicadas() ?
    //         this.selectionPrepublicadas.clear() :
    //         this.dataSourcePrepublicadas.data.forEach(row => this.selectionPrepublicadas.select(row));
    // };

    masterTogglePrepublicadas = ({checked}) => {
        this.isSeleccionadoTodos = checked;
        this.filaSeleccionadas = [];
        this.filaNoSeleccionadas = [];
    };

    selectedRowPrepublicadas = (row) => {
        this.selectionPrepublicadas.toggle(row);
        if (!this.isSeleccionadoTodos) {
            var existeFila = this.filaSeleccionadas?.some(x => x.idPlaza == row.idPlaza);
            if(existeFila){
            this.filaSeleccionadas = this.filaSeleccionadas?.filter(x => x.idPlaza != row.idPlaza);
            }else{
            this.filaSeleccionadas.push(row);
            }
        } 
    
            if (this.isSeleccionadoTodos) {
            var existeFila = this.filaNoSeleccionadas?.some(x => x.idPlaza == row.idPlaza);
            if(existeFila){
            this.filaNoSeleccionadas = this.filaNoSeleccionadas?.filter(x => x.idPlaza != row.idPlaza);
            }else{
            this.filaNoSeleccionadas.push(row);
            }
            }
    
    };

    verificaSeleccionPrePublicadas = (row):boolean =>{
        if(!this.isSeleccionadoTodos) {
            let estaSeleccioando = this.filaSeleccionadas
                        .some(fila => 
                              fila.idPlazaReasignacionDetalle 
                              == row.idPlazaReasignacionDetalle);
            return estaSeleccioando || this.isSeleccionadoTodos;
        }
    
        if(this.isSeleccionadoTodos) {
            let estaSeleccioando = this.filaNoSeleccionadas
                        .some(fila => 
                              fila.idPlazaReasignacionDetalle 
                              == row.idPlazaReasignacionDetalle);
            return !estaSeleccioando;
        }
    
    }

    checkboxLabelPlazasPrepublicadas(row?: any): string {
        let estilo;
            estilo =  `${this.selectionPrepublicadas.isSelected(row) ? "deselect" : "select"} row ${row?.position + 1}`;
            return  estilo;
    }

    // isAllSelectedPrepublicadas = (): boolean => {
    //     const numSelected = this.selectionPrepublicadas.selected.length;
    //     const numRows = this.dataSourcePrepublicadas.data.length;
    //     return numSelected === numRows;
    // };

    isAllSelectedPrepublicadas = () => {
        const numSelected = this.selectionPrepublicadas.selected.length;
        const numRows = this.dataSourcePrepublicadas.data.length;
        return numSelected === numRows;
    };

    checkboxAllPlazasPrePublicadas(): string {
        let estilo;
        estilo = `${(this.isAllSelectedPrepublicadas() || this.isSeleccionadoTodos) ? "select" : "deselect"} all`;
        return estilo;
    }

    selectedGridPrepublicadas = (param) => {
        this.selectionPrepublicadas.toggle(param);
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

    handleExportarPlazasPrepublicadas = () => {
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
            .exportarPlazaReasignacionPrepublicadasPrepublicacion(this.request)
            .pipe(
                catchError((e) => of(null)),
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
                            MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,
                            () => {}
                        );
                }
            });
    };

    private setRequest = () => {
        this.request = {
            idEtapaProceso:this.idEtapaProceso,
            idAlcanceProceso: this.idAlcanceProceso,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value,
            idInstancia: this.form.get('idInstancia').value == "-1" ? null : this.form.get('idInstancia').value,
            idSubInstancia: this.form.get('idSubInstancia').value == "-1" ? null: this.form.get('idSubInstancia').value
        };
    };

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
            .getGridPlazaReasignacionPrepublicadas(data, pageIndex, pageSize)
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
                    this.gridResultMessage(selectedTabIndex,false);
                }
            });
    }

    private gridResultMessage = (selectedTabIndex:number,emptyResult: boolean = true) => {
        this.totalregistro = 0;
        this._dataChange.next([]);
        if (emptyResult) {
            if(selectedTabIndex == 0){
                this.dataService.Message()
                .msgWarning('NO SE ENCONTRÓ INFORMACIÓN DE PLAZAS PREPUBLICADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.', () => {
                });    
            }
        } else {
            this.dataService.Message()
            .msgWarning('OCURRIERON PROBLEMAS AL MOMENTO DE BUSCAR PLAZAS PREPUBLICADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.', () => {                
            });
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