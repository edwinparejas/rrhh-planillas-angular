import { Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, Input } from '@angular/core';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { SelectionModel, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { ConsolidadoPlazaModel } from '../../../models/reasignacion.model';
import { DataService } from '../../../../../../../core/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { catchError, finalize } from 'rxjs/operators';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { InformacionPlazaComponent } from '../../../plazas/components/informacion-plaza/informacion-plaza.component';
import { InformacionMotivoNopublicacionComponent } from "../../../plazas/components/informacion-motivo-nopublicacion/informacion-motivo-nopublicacion.component";
import { descargarExcel } from 'app/core/utility/functions';

@Component({
    selector: 'minedu-consolidado-plazas-observadas',
    templateUrl: './consolidado-plazas-observadas.component.html',
    styleUrls: ['./consolidado-plazas-observadas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ConsolidadoPlazasObservadasComponent implements OnInit, AfterViewInit {

    dataSource: PlazaObservadaDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @Input() etapaProceso: number;
    @Input() consolidadoPlaza: ConsolidadoPlazaModel;
    working = false;
    dialogRef: any;
    displayedColumns: string[] = [
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
        'vigenciaInicio',
        'vigenciaFin',
        // 'plazasPara',
        'acciones',
    ];
    request: any = {};
    isMobile = false;

    constructor(private dataService: DataService, private materialDialog: MatDialog) { }

    ngOnInit(): void {
        this.dataSource = new PlazaObservadaDataSource(this.dataService);
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
        this.handleResponsive();
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

    actualizarLista = (request: any) => {
        this.request = request;
        this.buscarPlazas();
    }

    buscarPlazas = () => {
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    }

    loadData(): void {
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    }

    handleViewInfo = (id) => {
        this.dialogRef = this.materialDialog.open(InformacionPlazaComponent,
            {
                panelClass: 'informacion-plaza',
                disableClose: true,
                data: {
                    idPlazaReasignacion: 0,
                    idPlazaReasignacionDetalle: 0,
                    idPlaza: Number(id)
                },
            }
        );
    }

    informacionMotivoPlazaObservadaView = (row) => {
        this.dialogRef = this.materialDialog.open(InformacionMotivoNopublicacionComponent,
            {
                panelClass: 'informacion-sustento-motivo-no-publicacion',
                disableClose: true,
                data: {
                    idPlazaReasignacion: row.id_plaza_reasignacion,
                    idPlazaReasignacionDetalle: row.id_plaza_reasignacion_detalle
                },
            }
        );
    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => { });
            return;
        }

        this.dataService.Spinner().show('sp6');
            this.dataService.Reasignaciones().ExportaExcelPlazasObservadas(this.request, 1, this.dataSource.dataTotal).pipe(
            catchError((e) => of(null)),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response.file, 'Plazas_Observadas.xlsx');
            } else {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO."', () => { });
            }
        });
    }

}

export class PlazaObservadaDataSource extends DataSource<any> {
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
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            // this.dataService.Contrataciones().getListaplazasContratacionConvocar(data, pageIndex, pageSize).pipe(
                this.dataService.Reasignaciones().getListaplazasReasignacionConvocar(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                this._dataChange.next(response || []);
                this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_registros;
                if ((response || []).length === 0) {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE LAS PLAZAS OBSERVADAS PARA LOS CRITERIOS DE BÚSQUEDA."', () => { });
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