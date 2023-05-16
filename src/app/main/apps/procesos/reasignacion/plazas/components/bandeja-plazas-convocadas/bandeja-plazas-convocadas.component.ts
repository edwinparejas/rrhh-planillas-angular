import {AfterViewInit,Component,Input,OnDestroy,OnInit,ViewChild,ViewEncapsulation, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import { ReasignacionesModel } from "../../../models/reasignaciones.model";
import { mineduAnimations } from "@minedu/animations/animations";
import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { DataService } from "app/core/data/data.service";
import { SharedService } from "app/core/shared/shared.service";
import { catchError, filter, finalize, takeUntil } from "rxjs/operators";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { InformacionPlazaComponent } from '../informacion-plaza/informacion-plaza.component';
import { descargarExcel } from "app/core/utility/functions";
import { SustentoMotivoNoPublicacionPlazaComponent } from "../sustento-motivo-no-publicacion-plaza/sustento-motivo-no-publicacion-plaza.component";
import { MENSAJES } from "../../../_utils/constants";
import { codigoEstadoValidacionPlaza } from 'app/core/model/types-reasignacion';
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
    selector: "minedu-bandeja-plazas-convocadas",
    templateUrl: "./bandeja-plazas-convocadas.component.html",
    styleUrls: ["./bandeja-plazas-convocadas.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPlazasConvocadasComponent
    implements OnInit, OnDestroy, AfterViewInit
{
    @Input() form: FormGroup;
    @Input() btnBuscar: Observable<void>;
    @Input() idEtapaProceso:any;
    @Input() reasignacion: any;
    @Input() proceso: ReasignacionesModel;
    @Input() selectedTabIndex: any; 
    @Output() onBuscar: EventEmitter<boolean>;
    private btnBuscarSubscription: Subscription;
    idAlcanceProceso: number;
    plazaReasignacion: any = null;
    dialogRef: any;
    working = false;
    CodigoEstadoValidacionPlaza = codigoEstadoValidacionPlaza;
    isSeleccionadoTodos: boolean = false;
    totalSeleccionados: number = 0;

    displayedColumnsPlazas: string[] = [
        "select",
        "codigoModular",
        "centroTrabajo",
        "modalidad",
        "nivelEducativo",
        "tipoGestion",
        "codigoPlaza",
        "cargo",
        'areaCurricular',
        'tipoPlaza',
        'fechaVigenciaInicio',
        'fechaVigenciaFin',
        "acciones",
    ];

    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    request = {
        idEtapaProceso: null,
        idAlcanceProceso: null,
        codigoPlaza: null,
        codigoCentroTrabajo: null,
    };

    // ******************* Variables plazas a convocar
    dataSourceConvocadas: ConvocadasDataSource | null;
    selectionConvocadas = new SelectionModel<any>(true, []);
    // noSeleccionados: any[] = [];
    filaSeleccionadas:any[]=[];
    filaNoSeleccionadas:any[]=[];


    @ViewChild("paginatorConvocadas", { static: true })
    paginatorConvocadas: MatPaginator;
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
        this.btnBuscarSubscription = this.btnBuscar.subscribe(() => this.getDataGridConvocadas());
    
    }
    private buildGrid() {
        this.dataSourceConvocadas = new ConvocadasDataSource(
            this.dataService,
            this.sharedService
        );

        this.buildPaginators(this.paginatorConvocadas);
    }
    
    private buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = dutchRangeLabel;
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
        this.sharedService.setSharedBreadcrumb('Procesos de reasignación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de reasignación');
    }

    obtenerCabeceraProcesoEtapa = () => {
        this.dataService
            .Reasignaciones()
            .getDatosProcesoEtapaById(this.idEtapaProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {             
                this.proceso = response;                
            });
    };

    private getDataGridConvocadas = () => {
        this.setRequest();
        this.dataSourceConvocadas.load(
            this.request,
            this.paginatorConvocadas.pageIndex + 1,
            this.paginatorConvocadas.pageSize,
            this.selectedTabIndex
        );
    };

    selectedRow = (row) => {
        this.selectionConvocadas.toggle(row)
        if (this.isSeleccionadoTodos) {
            const exist = this.selectionConvocadas.selected.find(x => x.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
        }

    };

    private setRequest = () => {
        this.request = {            
            idEtapaProceso: +this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoCentroTrabajo: this.form.get('codigoModular').value,
        };
    };

//Seleccion masiva
    masterToggleConvocadas = ({checked}) => {
        this.isSeleccionadoTodos = checked;
        this.filaSeleccionadas = [];
        this.filaNoSeleccionadas = [];
    };

    isAllSelectedConvocadas = () => {
        const numSelected = this.selectionConvocadas.selected.length;
        const numRows = this.dataSourceConvocadas.data.length;
        return numSelected === numRows;
    };

    checkboxAllPlazasConvocadas(): string {
        let estilo;
        estilo = `${(this.isAllSelectedConvocadas() || this.isSeleccionadoTodos) ? "select" : "deselect"} all`;
        return estilo;
    }

    selectedRowConvocadas = (row) => {
        this.selectionConvocadas.toggle(row);
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

    verificaSeleccionConvocadas = (row):boolean =>{
        if(!this.isSeleccionadoTodos) {
            this.selectionConvocadas.isSelected(row);
            let estaSeleccioando = this.filaSeleccionadas
                        .some(fila => fila.idPlazaReasignacionDetalle == row.idPlazaReasignacionDetalle);
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

    checkboxLabelPlazasConvocadas(row?: any): string {
        let estilo;
            estilo =  `${this.selectionConvocadas.isSelected(row) ? "deselect" : "select"} row ${row?.position + 1}`;
            return  estilo;
    }

 // fin seleccion masiva

    selectedGridConvocadas = (param) => {
        this.selectionConvocadas.toggle(param);
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
            this.selectionConvocadas.clear();
        });
    }
    handleObservarPlazasConvocadas = () => {

        let plazasSeleccionadas = [];
        let plazasNoSeleccionadas = [];
        let observarPlaza: any = this.selectionConvocadas.selected;

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
            plazasReasignacionDetalle: plazasSeleccionadas,
            idEtapaProceso: this.idEtapaProceso,
            idPlazaReasignacion: this.reasignacion.idPlazaReasignacion,
            isSeleccionadoTodos: this.isSeleccionadoTodos,
            plazasNoSeleccionadas: plazasNoSeleccionadas,
            prepublicadas: false
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
                    // this.getDataGridConvocadas();
                    this.onBuscar.emit(true);
                    this.filaSeleccionadas= [];
                    this.filaNoSeleccionadas = [];
                    this.isSeleccionadoTodos = false;
                    // this.masterToggleConvocadas();
                    this.selectionConvocadas.clear();
                }else{
                    // this.masterToggleConvocadas();
                    this.filaSeleccionadas= [];
                    this.filaNoSeleccionadas = [];
                    this.isSeleccionadoTodos = false;
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
                    MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_PARA_EXPORTAR, 
                    () => {
                    }
                );
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .exportarPlazaReasignacionConvocadas(this.request)
            .pipe(
                catchError((e) => of(null)),
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
                            MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA, 
                            () => {}
                        );
                }
            });
    };
}

export class ConvocadasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(
        private dataService: DataService,
        private sharedService: SharedService
    ) {
        super();
    }

    load(data: any, pageIndex, pageSize, selectedTabIndex: number): void {
        this.dataService
            .Reasignaciones()
            .getGridPlazaReasignacionConvocadas(data, pageIndex, pageSize)
            .pipe(
                catchError(() => of(null)),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide("sp6");
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
                        this.totalregistro =
                            (rows || []).length === 0
                                ? 0
                                : rows[0].totalRegistros;
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
            if(selectedTabIndex == 1){
                this.dataService
                    .Message()
                    .msgWarning(
                        "NO SE ENCONTRÓ INFORMACIÓN DE PLAZAS CONVOCADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.",
                        () => {}
                    );
                }
        } else {
            this.dataService
                .Message()
                .msgWarning(
                    "OCURRIERON PROBLEMAS AL MOMENTO DE BUSCAR PLAZAS CONVOCADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS.",
                    () => {}
                );
        }
    };

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
