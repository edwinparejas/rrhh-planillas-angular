import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { DataService } from '../../../../../../../core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { saveAs } from 'file-saver';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { MatPaginator } from '@angular/material/paginator';
import { EtapaResponseModel, ConsolidadoPlazaModel, ResumenPlazasResponseModel } from '../../../models/contratacion.model';
import { ResultadoFinalEnum } from '../../../_utils/constants';

@Component({
    selector: 'minedu-plazas-resultado-final',
    templateUrl: './plazas-resultado-final.component.html',
    styleUrls: ['./plazas-resultado-final.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PlazasResultadoFinalComponent implements OnInit {
    dataSource: PlazaDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @Input() etapa: EtapaResponseModel;
    @Input() consolidadoPlaza: ConsolidadoPlazaModel;
    @Input() resumenPlazas: ResumenPlazasResponseModel;
    selection = new SelectionModel<any>(true, []);
    isMobile = false;
    resultadoFinal = ResultadoFinalEnum;
    request: any;

    displayedColumns: string[] = [
        'registro',
        'descripcionDepartamento',
        'descripcionInstancia',
        'descripcionInstitucionEducativa',
        'codigoPlaza',
        'descripcionTipoCargo',
        'descripcionCargo',
        'descripcionCondicionPlaza',
        'descripcionTipoPlaza',
        'vigenciaInicio',
        'vigenciaFin',
        'descripcionEstadoFinal'
    ];

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    constructor(
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.handleResponsive();
        this.startDataSource();
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    startDataSource(): void {
        this.dataSource = new PlazaDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {return `0 de ${length}`;}
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
    }

    buscarPlazas = (fistTime: boolean = false) => {
        this.selection = new SelectionModel<any>(true, []);
        if (fistTime) {
            this.dataSource.load(this.request, 1, 10);
        } else {
            this.dataSource.load(
                this.request,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize
            );
        }
    }

    actualizarLista = (request: any) => {
        this.request = request;
        this.buscarPlazas(false);
    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning('No se encontró información para exportar.', () => { });
            return;
        }

        this.dataService.Spinner().show('sp6');
        this.dataService
            .Contrataciones()
            .ExportaExcelPlazasResultadoFinal(
                this.request,
                1,
                this.dataSource.dataTotal)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    saveAs(response, 'Plazas-resultado-final.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'No se encontró información para los criterios de búsqueda ingresado',
                            () => { }
                        );
                }
            });
    }
}

export class PlazaDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this.dataService.Spinner().show('sp6');
        this._loadingChange.next(false);
        if (data.anio === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Contrataciones()
                .getListaplazasResultadoFinal(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide('sp6');
                    })
                )
                .subscribe((response: any) => {
                    this._dataChange.next(response.data || []);
                    this.totalregistro = (response.data || []).length === 0 ? 0 : response.data[0].totalRegistro;
                    if ((response.data || []).length === 0) {
                        this.dataService
                            .Message()
                            .msgWarning(
                                'No se encontró información de la(s) contratación(s) para los criterios de búsqueda ingresados.',
                                () => { }
                            );
                    }
                });
        }

        /* this._dataChange.next(data);
        this.totalregistro = 0; */
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

