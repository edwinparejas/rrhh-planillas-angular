import { Component, OnInit, ViewEncapsulation, AfterViewInit, ViewChild, Input } from '@angular/core';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { DataService } from '../../../../../../../core/data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ConsolidadoPlazaModel, EtapaResponseModel } from '../../../models/reasignacion.model';
import { catchError, finalize } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { InformacionPlazaComponent } from '../../../plazas/components/informacion-plaza/informacion-plaza.component';
import { descargarExcel } from 'app/core/utility/functions';
import { MENSAJES } from '../../../_utils/constants';

@Component({
  selector: 'minedu-consolidado-plazas-convocar',
  templateUrl: './consolidado-plazas-convocar.component.html',
  styleUrls: ['./consolidado-plazas-convocar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,  
})
export class ConsolidadoPlazasConvocarComponent implements OnInit, AfterViewInit {

    dataSource: PlazaDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    @Input() etapaProceso: number;
    @Input() consolidadoPlaza: ConsolidadoPlazaModel;
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
        'acciones',
    ];
    dialogRef: any;
    isMobile = false;
    request: any = {};

    constructor(private dataService: DataService, private materialDialog: MatDialog) { }

    ngOnInit(): void {
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

    actualizarLista = (request: any) => {
        this.request = request;
        this.buscarPlazas();
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.loadData());
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

    buscarPlazas = () => {
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService.Message().msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_PARA_EXPORTAR, () => { });
            return;
        }

        this.dataService.Spinner().show('sp6');
            this.dataService.Reasignaciones().ExportaExcelPlazasConvocadas(this.request, 1, this.dataSource.dataTotal).pipe(
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
                this.dataService.Message().msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA, () => { });
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
        if (data.idEtapaProceso === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
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
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE PLAZAS A CONVOCAR PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
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
