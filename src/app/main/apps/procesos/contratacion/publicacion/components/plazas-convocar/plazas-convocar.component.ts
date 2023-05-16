import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';
import { EtapaResponseModel, ConsolidadoPlazaModel, ResumenPlazasResponseModel } from '../../../models/contratacion.model';
import { saveAs } from 'file-saver';
import { EstadoPlazaEnum, EstadoConsolidadoPlazaEnum } from '../../../_utils/constants';
import { MatDialog } from '@angular/material/dialog';
import { RegistraMotivoNoPublicacionComponent } from '../registra-motivo-no-publicacion/registra-motivo-no-publicacion.component';
import { InformacionPlazaComponent } from '../informacion-plaza/informacion-plaza.component';

@Component({
    selector: 'minedu-plazas-convocar',
    templateUrl: './plazas-convocar.component.html',
    styleUrls: ['./plazas-convocar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class PlazasConvocarComponent implements OnInit, OnDestroy, AfterViewInit {
    dataSource: PlazaDataSource | null;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    selection = new SelectionModel<any>(true, []);
    @Input() etapa: EtapaResponseModel;
    @Input() consolidadoPlaza: ConsolidadoPlazaModel;

    export = false;
    dialogRef: any;
    isMobile = false;
    estadoConsolidadoPlaza = EstadoConsolidadoPlazaEnum;

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
        private materialDialog: MatDialog,
    ) { }

    displayedColumns: string[] = [
        'registro',
        'codigoModular',
        'descripcionInstitucionEducativa',
        'abreviaturaModalidadEducativa',
        'descripcionNivelEducativo',
        'descripcionTipoGestionEducativa',
        'nombreZona',
        'eib',
        'codigoPlaza',
        'descripcionCargo',
        'descripcionAreaCurricular',
        'jornadaLaboral',
        'descripcionTipoPlaza',
        'descripcionMotivoVacancia',
        'vigenciaInicio',
        'vigenciaFin',
        'acciones',
    ];

    request: any;

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

    actualizarLista = (request: any) => {
        this.request = request;
        this.buscarPlazas(false);
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );
    }

    ngOnDestroy(): void { }

    loadData(pageIndex, pageSize): void {
        // this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    handleViewInfo = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(InformacionPlazaComponent, {
            panelClass: 'informacion-plazos-dialog',
            width: '1080px',
            disableClose: true,
            data: {
                idPlaza: row.idPlaza
            },

        });
        this.dialogRef.afterClosed().subscribe((resp) => {
        });
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

    isAllSelected = () => {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    masterToggle = () => {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning('No se encontró información para exportar.', () => { });
            return;
        }

        this.export = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Contrataciones()
            .ExportaExcelPlazasConvocadas(
                this.request,
                1,
                this.dataSource.dataTotal)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                    this.export = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    saveAs(response, 'Plazas-convocar.xlsx');
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

    handleObservarPlazas = () => {
        if (this.selection.selected.length === 0) {
            this.dataService.Message().msgWarning('Debe seleccionar como mínimo un registro de la grilla.', () => { });
            return;
        }

        const data: any[] = [];
        this.selection.selected.forEach(element => {
            const plaza = {
                idPlazaContratacion: element.idPlazaContratacion,
                idProceso: this.etapa.idProceso,
                idEtapa: this.etapa.idEtapa,
                idPlaza: element.idPlaza,
                idCentroTrabajo: element.idCentroTrabajo,
                idMotivoNoPublicacion: 0,
                detalleNoPublicacion: null,
                idEstadoPlaza: EstadoPlazaEnum.VACANTE,
                esPublicado: false,
                idResumenPlaza: this.consolidadoPlaza.idResumenPlaza
            };
            data.push(plaza);
        });

        this.dialogRef = this.materialDialog.open(RegistraMotivoNoPublicacionComponent, {
            panelClass: 'registra-motivo-no-publicacion-dialog',
            width: '1080px',
            disableClose: true,
            data: {
                action: 'registrar',
                plazas: data
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.buscarPlazas();
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
                .getListaplazasContratacionConvocar(data, pageIndex, pageSize)
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

