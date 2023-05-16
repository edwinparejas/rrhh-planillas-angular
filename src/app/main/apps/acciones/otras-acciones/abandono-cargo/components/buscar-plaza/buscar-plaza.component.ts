import { Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { GlobalsService } from 'app/core/shared/globals.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'minedu-buscar-plaza',
    templateUrl: './buscar-plaza.component.html',
    styleUrls: ['./buscar-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscarPlazaComponent implements OnInit, OnDestroy {

    form: FormGroup;
    
    comboLists = {
        listRegimenlaboral: []
    };

    displayedColumns: string[] = [
        'codigoPlaza',
        'codigoModular',
        'centroTrabajo',
        'modalidad',
        'nivelEducativo',
        'regimenLaboral',
        'cargo',
        'jornadaLaboral',
        'condicionPlaza',
        'tipoPlaza'
    ];

    dataSource: PlazaDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;

    constructor(
        public matDialogRef: MatDialogRef<BuscarPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.cargarTodo();
    }

    private async cargarTodo() {

        this.buildForm();
        await this.buildData();

        this.dataSource = new PlazaDataSource(this.dataService);
        this.buildPaginators(this.paginator);

        this.paginator.page
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(x => {
                this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.paginator.pageSize);
        });


        if (this.data?.idRegimenLaboralSeleccionado) {
            this.form.controls["idRegimenLaboral"].setValue(this.data.idRegimenLaboralSeleccionado);
        }

        if (this.data?.codigoPlaza) {
            this.form.controls["codigoPlaza"].setValue(this.data.codigoPlaza);
        }
    }

    buildForm() {
        this.form = this.formBuilder.group({
            codigoPlaza: [null],
            centroTrabajo: [null],
            codigoCentroTrabajo: [null],
            idRegimenLaboral: [-1]
        });
    }

    buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = "Registros por página";
        paginator._intl.nextPageLabel = "Siguiente página";
        paginator._intl.previousPageLabel = "Página anterior";
        paginator._intl.firstPageLabel = "Primera página";
        paginator._intl.lastPageLabel = "Última página";
        paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) {
                return `0 de ${length}`;
            }
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }
    }

    request = {
        idRegimenLaboral: -1,
        codigoPlaza: null,
        centroTrabajo: null,
        codigoTipoSede: null,
        codigoRol: null,
        codigoCentroTrabajo: null,
        paginaActual: 1,
        tamanioPagina: 10,
        codigoSede: null
    };

    async buildData() {
        const usuario = this.dataService.Storage().getPassportRolSelected();

        let request = {
            codigoRol: usuario.CODIGO_ROL,
            codigoTipoSede: usuario.CODIGO_TIPO_SEDE,
            codigoCentroTrabajo: usuario.CODIGO_SEDE,
            SinFiltro: true
        }
    
        this.dataService.OtrasFuncionalidades().getComboRegimenLaboral(request).pipe(
                catchError(() => {
                    return of([]);
                }),
                finalize(() => { })
            ).subscribe(
            (response) => {
                this.comboLists.listRegimenlaboral = response;
            },
            (error: HttpErrorResponse) => {
                console.log(error);
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    loadPlaza() {
        this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
    }

    selectedRow(row) {
        this.selection.clear();
        this.selection.toggle(row);
        return row;
    }

    limpiar() {
        this.form.patchValue({
            codigoPlaza: null,
            centroTrabajo: null,
            codigoCentroTrabajo: null,
            idRegimenLaboral: -1
        });
    }

    getRequest = () => {
        const usuario = this.dataService.Storage().getPassportRolSelected();
        this.request = {
            codigoSede: usuario.CODIGO_SEDE,
            codigoPlaza: this.form.get('codigoPlaza').value,
            idRegimenLaboral: this.form.get('idRegimenLaboral').value,
            centroTrabajo: this.form.get('centroTrabajo').value,
            codigoCentroTrabajo: this.form.get('codigoCentroTrabajo').value,
            codigoTipoSede: usuario.CODIGO_TIPO_SEDE,
            codigoRol: usuario.CODIGO_ROL,
            paginaActual: 1,
            tamanioPagina: 10
        };
    }

    buscar() {
        const form = this.form.value;
        if (form.codigoPlaza || form.centroTrabajo || form.codigoCentroTrabajo || form.idRegimenLaboral != -1) {
            this.getRequest();
            this.dataSource.load(this.request,
                (this.paginator.pageIndex + 1),
                this.globals.paginatorPageSize
            );
        } else {
            this.dataService.Message().msgWarning('Ingrese al menos un criterio de búsqueda.', () => { });
            return;
        }
    }
}

export class PlazaDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);
    private _totalRows = 0;
    public loading = this._loadingChange.asObservable();
  
    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex: number, pageSize: number) {

        this.dataService.Spinner().show("sp6");
        this._loadingChange.next(false);

        this.dataService.OtrasFuncionalidades().getCodigoPlazaTransversal(data, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => {
                this._loadingChange.next(false);
                this.dataService.Spinner().hide("sp6");
            })
        ).subscribe((response: any) => {
            this._dataChange.next(response || []);
            this._totalRows = ((response || []).length === 0) ? 0 : response[0].totalRegistro;
            if ((response || []).length === 0) {
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
                this._totalRows = 0;
                this._dataChange.next([]);
            }
            else{
                this._totalRows = (response[0] || [{
                        totalRegistro: 0
                    }
                ]).totalRegistro;
                this._dataChange.next(response || []);
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
        return this._totalRows;
    }
    get data(): any {
        return this._dataChange.value || [];
    }
}
