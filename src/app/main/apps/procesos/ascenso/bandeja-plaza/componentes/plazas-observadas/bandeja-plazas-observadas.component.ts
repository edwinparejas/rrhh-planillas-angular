import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Component, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { descargarExcel } from "app/core/utility/functions";
import { ConsolidadoPlazaModel } from "app/main/apps/procesos/contratacion/models/contratacion.model";
import { InformacionPlazaValidacionComponent } from "app/main/apps/procesos/contratacion/validacionplaza/informacion-plaza-validacion/informacion-plaza-validacion.component";
import { SituacionPlazaAscensoEnum } from "app/main/apps/procesos/contratacion/_utils/constants";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { VerInformacionPlazaAscensoComponent } from "../informacion-plaza/ver-informacion-plaza.component";

@Component({
    selector: 'minedu-bandeja-plazas-observadas',
    templateUrl: './bandeja-plazas-observadas.component.html',
    styleUrls: ['./bandeja-plazas-observadas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})

export class BandejaPlazasObservadas {
    dataSource: PlazaDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    idProceso: number;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @Input() etapaProceso: number;
    @Input() consolidadoPlaza: ConsolidadoPlazaModel;

    displayedColumnsPlazasObservadas: string[] = [
        'registro',
        'instancia',
        'subinstancia',
        'codigoModular',
        'centroTrabajo',
        'modalidad',
        'nivelEducativo',
        'tipoGestion',
        'dependencia',
        'codigoPlaza',
        'cargo',
        'tipoPlaza',
        'vigenciaInicio',
        'vigenciaFin',
        'acciones',
    ];

    selectionPlazasObservadas = new SelectionModel<any>(true, []);

    dialogRef: any;
    isMobile = false;
    request: any = {};
    requestConvocar = {
        idPlazaAscenso: null,
        anio: null,
        idSituacionValidacion: null,
        idsPlaza: null,
    };
    constructor(
        private dataService: DataService,
        private materialDialog: MatDialog,
        private rutaActiva: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.idProceso = this.rutaActiva.snapshot.params.idProceso;
        this.buildGrids();
        this.handleResponsive();
        this.listarPlazasObservadas(true);
    }

    buildGrids(): void {
        this.dataSource = new PlazaDataSource(this.dataService);
        this.buildPaginators(this.paginator);
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Filas por tabla";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
    }

    listarPlazasObservadas = (fistTime: boolean = false) => {
        this.setRequest(); //ids combos
        if (fistTime) {
            this.dataSource.load(this.request, 1, this.paginatorPageSize);
        } else {
            this.dataSource.load(
                this.request,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize
            );
        }
    }

    setRequest = () => {
        this.request = {
            idProcesoEtapa: this.idProceso,
            anio: 2021,
            idSituacionValidacion: SituacionPlazaAscensoEnum.OBSERVADA,
        };
    }

    setrequestConvocar = () => {
        this.requestConvocar = {
            idPlazaAscenso: this.dataSource.idplazaascenso,
            anio: 2021,
            idSituacionValidacion: SituacionPlazaAscensoEnum.A_CONVOCAR,
            idsPlaza: null
        };
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.loadData());
    }

    loadData(): void {
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    }

    // handleViewInfo = (id) => {
    //     this.dialogRef = this.materialDialog.open(InformacionPlazaValidacionComponent, {
    //         panelClass: "informacion-validacion-plazas-dialog",
    //         width: "1000px",
    //         disableClose: true,
    //         data: {
    //             idPlaza: id,
    //         },
    //     });
    // }
    handleViewInfo = (id) => {
        console.log("id", id);
        this.dialogRef = this.materialDialog.open(VerInformacionPlazaAscensoComponent, {
            panelClass: "minedu-ver-informacion-plazas-dialog",
            width: "1000px",
            disableClose: true,
            data: {
                dataKey: id,
            },
        });
    }

    buscarPlazas = () => {
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    }

    handleConvocarPlaza = () => {
        if (this.selectionPlazasObservadas.selected.length === 0) {
            this.dataService.Message().msgWarning('"NO SE HA SELECCIONADO NINGUN REGISTRO."', () => { });
            return;
        }
        this.setrequestConvocar();
        console.log('handleConvocarPlaza',this.requestConvocar.idsPlaza);
        console.log('handleConvocarPlaza',this.selectionPlazasObservadas.selected.length);
        this.selectionPlazasObservadas.selected.forEach(x => {
            
            if (this.requestConvocar.idsPlaza === null){

                this.requestConvocar.idsPlaza = x.idPlaza.toString();
            }else{
                this.requestConvocar.idsPlaza = this.requestConvocar.idsPlaza + "|" + x.idPlaza;
            }
        });
        console.log('handleConvocarPlaza',this.requestConvocar.idsPlaza);
        this.dataService.Spinner().show('sp6');
        this.dataService.Ascenso().actualizarPlazaAscenso(this.requestConvocar).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            }
            )
        )
            .subscribe((response: any) => {
                if (response) {
                    this.requestConvocar.idsPlaza = null;
                    this.listarPlazasObservadas(true);
                    this.dataService.Message().msgWarning('"PLAZAS CONVOCADAS CORRECTAMENTE."', () => { });
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO REALIZAR LA ACCIÓN"', () => { });
                }
            });

    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => { });
            return;
        }

        this.dataService.Spinner().show('sp6');
        this.dataService.Contrataciones().ExportaExcelPlazasConvocadas(this.request, 1, this.dataSource.dataTotal).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            }
            )
        )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response.file, 'Plazas_Convocar.xlsx');
                } else {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."', () => { });
                }
            });
    }

    isAllSelectedPlazasObservadas = () => {
        const numSelected = this.selectionPlazasObservadas.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    };

    masterTogglePlazasObservadas = () => {
        this.isAllSelectedPlazasObservadas() ? this.selectionPlazasObservadas.clear() : this.dataSource.data.forEach((row) =>
            this.selectionPlazasObservadas.select(row)
        );
    };

    checkboxLabelPlazasObservadas(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasObservadas() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasObservadas.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }
}

export class PlazaDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    public idplazaascenso = 0;
    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        if (data.anio === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Ascenso()
                .getListaPlazasObservadas(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        this._dataChange.next(response || []);
                        this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistro;
                        this.idplazaascenso = (response || []).length === 0 ? 0 : response[0].idPlazaAscenso;
                        
                        if ((response || []).length === 0) {
                            //M09 - “NO SE ENCONTRÓ INFORMACIÓN DE ACUERDO CON LOS CRITERIOS DE BÚSQUEDA INGRESADOS”
                            this.dataService.Message().msgWarning('No se encontró información de acuerdo con los criterios de búsqueda ingresados.', () => { });
                        }
                    } else {
                        this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
                    }
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