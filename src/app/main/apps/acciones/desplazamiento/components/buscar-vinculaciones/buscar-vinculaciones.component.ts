import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ResultadoOperacionEnum } from '../../_utils/constants';

@Component({
    selector: 'minedu-buscar-vinculaciones',
    templateUrl: './buscar-vinculaciones.component.html',
    styleUrls: ['./buscar-vinculaciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BuscarVinculacionesComponent implements OnInit, OnDestroy, AfterViewInit {
    icon = 'create';
    dialogTitle: string = 'Buscar Vinculaciones';
    form: FormGroup;

    idPersonaSeleccionado: 0;
    selection = new SelectionModel<any>(true, []);
    dataSource: VinculacionesDataSource | null;
    
    
    request = {
        idPersona: null,
        paginaActual: 1,
        tamanioPagina: 10,
    };

    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    displayedColumns: string[] = [
        'regimenLaboral',
        'condicionLaboral',
        'centroLaboral',
        'codigoPlaza',
        'jornadaLaboral',
        'modalidad',
        'nivelEducativo',
        'especialidad'
    ];

    @ViewChild('paginator', { static: true })
    paginator: MatPaginator;

    constructor(public matDialogRef: MatDialogRef<BuscarVinculacionesComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        public globals: GlobalsService,) { }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
        this.idPersonaSeleccionado = this.data.idPersonaSeleccionado;
        this.dataSource = new VinculacionesDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.loadVinculaciones();
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );
    }

    setRequest = () => {
        this.request = {
            idPersona: this.idPersonaSeleccionado,
            paginaActual: 1,
            tamanioPagina: 10
        };
    }

    loadData(pageIndex, pageSize): void {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    selectedRow(row) {
        this.selection.clear();
        this.selection.toggle(row);

        return row;
    }

  

    handleCancel = () => {
        this.matDialogRef.close({});
    }

    loadVinculaciones = (fistTime: boolean = false) => {
        this.setRequest();
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

}

export class VinculacionesDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);
        this.dataService.AccionesPersonal().buscarVinculacionesPorPersona(data, pageIndex, pageSize)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this._loadingChange.next(false))
            ).subscribe((response: any) => {
                this._dataChange.next(response || []);
                this.totalregistro = ((response || [])?.length === 0) ? 0 : response[0]?.totalRegistro;

                if ((response || []).length === 0) {
                    this.dataService.Message().msgWarning('No se encontró información de vinculacion de el(los) servidor(es) para los criterios de búsqueda ingresados.', () => { });
                }

                if (response && response.result) {

                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } 
            });
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