import { CollectionViewer, DataSource, SelectionModel } from "@angular/cdk/collections";
import { AfterViewInit, Component, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute } from "@angular/router";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { descargarExcel } from "app/core/utility/functions";
import { ConsolidadoPlazaModel } from "app/main/apps/procesos/contratacion/models/contratacion.model";
import { InformacionPlazaValidacionComponent } from "app/main/apps/procesos/contratacion/validacionplaza/informacion-plaza-validacion/informacion-plaza-validacion.component";
import { SituacionPlazaAscensoEnum, SituacionPlazasEnum } from "app/main/apps/procesos/contratacion/_utils/constants";
import { forEach } from "lodash";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { VerInformacionPlazaAscensoComponent } from "../informacion-plaza/ver-informacion-plaza.component";

@Component({
    selector: 'minedu-plazas-pre-publicadas',
    templateUrl: './bandeja-plazas-prePublicadas.component.html',
    styleUrls: ['./bandeja-plazas-prePublicadas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})

export class BandejaPlazasPrePublicadas implements OnInit, AfterViewInit {
    dataSource: PlazaDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    idProceso: number;
    form: FormGroup;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @Input() etapaProceso: number;
    @Input() consolidadoPlaza: ConsolidadoPlazaModel;

    displayedColumnsPlazasPrePublicadas: string[] = [
        'registro',
        'institucionEducativa',
        'gestion',
        'zona',
        'codigoModularIE',
        'codigoPlaza',
        'cargo',
        'especialidad',
        'jornadaLaboral',
        'distrito',
        'tipoVacancia',
        'motivoVacancia',
        'acciones',
    ];
    selectionPlazasPrePublicadas = new SelectionModel<any>(true, []);

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
        private formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.idProceso = this.rutaActiva.snapshot.params.idProceso;
        this.buildGrids();
        this.handleResponsive();
        this.listarPlazasPrePublicadas(true);
    }

    ngAfterViewInit(): void {
        //this.paginator.page.subscribe(() => this.loadData());
        this.paginator.page.subscribe(() => this.listarPlazasPrePublicadas());

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

    listarPlazasPrePublicadas = (fistTime: boolean = false) => {
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
            idProcesoEtapa: 3,
            anio: 2021,
            idSituacionValidacion: SituacionPlazaAscensoEnum.PRE_PUBLICADA,
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

    // actualizarLista = () => {
    //     this.setRequest();
    //     this.request = request;
    //     this.buscarPlazas();
    // }

    loadData(): void {
        this.setRequest();
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    }

    // handleViewInfo = (row) => {
    //     this.dialogRef = this.materialDialog.open(VerInformacionPlazaAscensoComponent, {
    //         panelClass: 'minedu-ver-informacion-adjudicacion-dialog',
    //         width: '980px',
    //         disableClose: true,
    //         data: {
    //             action: 'busqueda',
    //             dataKey : row
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

    handleGenerarPlaza = () => {
        this.dataService.Spinner().show('sp6');
        this.dataService.Ascenso().generarPlazaAscenso(this.request).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            }
            )
        )
            .subscribe((response: any) => {
                if (response) {
                    this.listarPlazasPrePublicadas(true);
                    this.dataService.Message().msgWarning('"PLAZAS GENERADAS CORRECTAMENTE."', () => { });
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO GENERAR LAS PLAZAS"', () => { });
                }
            });

    }

    handleConvocarPlaza = () => {
        if (this.selectionPlazasPrePublicadas.selected.length === 0) {
            this.dataService.Message().msgWarning('"NO SE HA SELECCIONADO NINGUN REGISTRO."', () => { });
            return;
        }
        this.setrequestConvocar();
        console.log('setrequestConvocar',this.requestConvocar.idsPlaza);
        console.log('handleConvocarPlaza',this.selectionPlazasPrePublicadas.selected.length);
        this.selectionPlazasPrePublicadas.selected.forEach(x => {
            
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
                    this.selectionPlazasPrePublicadas = new SelectionModel<any>(true, []);
                    this.listarPlazasPrePublicadas(true);
                    this.dataService.Message().msgWarning('"PLAZAS CONVOCADAS CORRECTAMENTE."', () => { });
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO REALIZAR LA ACCIÓN"', () => { });
                }
            });

    }

    handleObservarPlaza = () => {
        if (this.selectionPlazasPrePublicadas.selected.length === 0) {
            this.dataService.Message().msgWarning('"NO SE HA SELECCIONADO NINGUN REGISTRO."', () => { });
            return;
        }
        this.setrequestObservada();
        console.log('setrequestObservada',this.requestConvocar.idsPlaza);
        console.log('handleConvocarPlaza',this.selectionPlazasPrePublicadas.selected.length);
        this.selectionPlazasPrePublicadas.selected.forEach(x => {
            
            if (this.requestConvocar.idsPlaza === null){

                this.requestConvocar.idsPlaza = x.idPlaza.toString();
            }else{
                this.requestConvocar.idsPlaza = this.requestConvocar.idsPlaza + "|" + x.idPlaza;
            }
        });
        console.log('handleObservarPlaza',this.requestConvocar.idsPlaza);
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
                    this.selectionPlazasPrePublicadas = new SelectionModel<any>(true, []);
                    this.listarPlazasPrePublicadas(true);
                    this.dataService.Message().msgWarning('"PLAZAS OBSERVADAS CORRECTAMENTE."', () => { });
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO REALIZAR LA ACCIÓN"', () => { });
                }
            });

    }

    isAllSelectedPlazasPrePublicadas = () => {
        const numSelected = this.selectionPlazasPrePublicadas.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    };

    masterTogglePlazasPrePublicadas = () => {
        this.isAllSelectedPlazasPrePublicadas() ? this.selectionPlazasPrePublicadas.clear() : this.dataSource.data.forEach((row) =>
            this.selectionPlazasPrePublicadas.select(row)
        );
    };

    checkboxLabelPlazasPrePublicadas(row?: any): string {
        if (!row) {
            return `${this.isAllSelectedPlazasPrePublicadas() ? "select" : "deselect"} all`;
        }
        return `${this.selectionPlazasPrePublicadas.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
    }
}

export class PlazaDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    public idplazaascenso = 0;
    constructor(
        private dataService: DataService) {
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