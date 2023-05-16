import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormGroup,FormBuilder } from "@angular/forms";
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

@Component({
    selector: 'minedu-documento-sustento',
    templateUrl: './documento-sustento.component.html',
    styleUrls: ['./documento-sustento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})

export class DocumentoSustento implements OnInit {
    dataSource: PlazaDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    idProceso: number;
    now = new Date();
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @Input() etapaProceso: number;
    @Input() consolidadoPlaza: ConsolidadoPlazaModel;
    form: FormGroup;
    selectedTipoDoc = 0;
    displayedColumns: string[] = [
        'tipoDocumento',
        'numeroDocumento',
        'fechaEmision',
        'tipoFormato',
        'folios',
        'fechaRegistro',
        'acciones'
    ];

    comboLists = {
        listTipoDocumento: [],
    }

    selectionPlazasConvocadas = new SelectionModel<any>(true, []);
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
        private rutaActiva: ActivatedRoute,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit(): void {
        this.idProceso = this.rutaActiva.snapshot.params.idProceso;
        this.buildForm();
        this.buildGrids();
        this.handleResponsive();
        this.loadTipoDocumento();
    }
    buildForm(): void {
        this.form = this.formBuilder.group({
            idTipoDocumento: [null]
            
        });
    }
    handleNuevo = () => {
        
    }
    handleCancel = () => {

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

    listarPlazasConvocar = (fistTime: boolean = false) => {
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
            idSituacionValidacion: SituacionPlazaAscensoEnum.A_CONVOCAR

        };
    }

    setrequestObservada = () => {
        this.requestConvocar = {
            idPlazaAscenso: this.dataSource.idplazaascenso,
            anio: 2021,
            idSituacionValidacion: SituacionPlazaAscensoEnum.OBSERVADA,
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


    buscarPlazas = () => {
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    }

    handleObservarPlaza = () => {
        if (this.selectionPlazasConvocadas.selected.length === 0) {
            this.dataService.Message().msgWarning('"NO SE HA SELECCIONADO NINGUN REGISTRO."', () => { });
            return;
        }
        this.setrequestObservada();
        this.selectionPlazasConvocadas.selected.forEach(x => {
            
            if (this.requestConvocar.idsPlaza === null){

                this.requestConvocar.idsPlaza = x.idPlaza.toString();
            }else{
                this.requestConvocar.idsPlaza = this.requestConvocar.idsPlaza + "|" + x.idPlaza;
            }
        });
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
                    this.listarPlazasConvocar(true);
                    this.dataService.Message().msgWarning('"PLAZAS OBSERVADAS CORRECTAMENTE."', () => { });
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

    isAllSelectedPlazasConvocadas = () => {
        const numSelected = this.selectionPlazasConvocadas.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    };

    masterTogglePlazasConvocadas = () => {
        this.isAllSelectedPlazasConvocadas() ? this.selectionPlazasConvocadas.clear() : this.dataSource.data.forEach((row) =>
            this.selectionPlazasConvocadas.select(row)
        );
    };

    checkboxLabelPlazasConvocadas(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasConvocadas() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasConvocadas.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }
    loadTipoDocumento = () => {
        this.dataService.AccionesPersonal()
            .getComboTipoDocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                console.log("probando", response)
                if (response) {
                    var index = 0;
     
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTipoDocumento = data;
                }
            });
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
                .getListaPlazasPrePublicadas(data, pageIndex, pageSize)
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