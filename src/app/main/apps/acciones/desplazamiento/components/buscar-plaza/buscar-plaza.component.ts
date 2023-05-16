import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize, tap, takeUntil } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { cargarCombos } from '../../_utils/constants';
import { GlobalsService } from 'app/core/shared/globals.service';
import { EntidadSedeService } from '../../Services/entidad-sede.service';

@Component({
    selector: 'minedu-buscar-plaza',
    templateUrl: './buscar-plaza.component.html',
    styleUrls: ['./buscar-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscarPlazaComponent implements OnInit, OnDestroy {

    form: FormGroup;
    IDROLPASSPORT: string = null;
    IDNIVELINSTANCIA: string = null;

    comboLists = {
        listRegimenlaboral: []
    };

    regimenesLaborales: any[] = [];

    displayedColumns: string[] = [
        'codigoPlaza',
        'codigoModular',
        'centroTrabajo',
        'modalidad',
        'nivelEducativo',
        'regimenLaboral',
        'cargo',
        'areaCurricular',
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
        public globals: GlobalsService,
        private entidadSedeService: EntidadSedeService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.cargarTodo();
    }

    private async cargarTodo() {
        this.buildForm();

        await this.setIdsRolCentroTrabajo();
        await this.buildData();


        this.dataSource = new PlazaDataSource(this.dataService, this.paginator);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
        this.paginator._intl.nextPageLabel = "Siguiente página";
        this.paginator._intl.previousPageLabel = "Página anterior";
        this.paginator._intl.firstPageLabel = "Primera página";
        this.paginator._intl.lastPageLabel = "Última página";

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
            this.buscar();
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

    request = {
        idRegimenLaboral: -1,
        codigoPlaza: null,
        centroTrabajo: null,
        codigoCentroTrabajo: null,
        paginaActual: 1,
        tamanioPagina: 10,
        codigoSede: null,
        codigoTipoSede: null
    };

    private async setIdsRolCentroTrabajo() {

        const currentSession = this.dataService.Storage().getInformacionUsuario();
        const codigoRolPassport = currentSession.codigoRol;

        const { codigoSede } = this.entidadSedeService.entidadSede;

        let isSuccess = true;
        const response = await this.dataService.AccionesPersonal()
            .getRolCentroTrabajo(codigoRolPassport, codigoSede)
            .pipe(
                catchError(() => { isSuccess = false; return of([]); }),
                finalize(() => { })
            )
            .toPromise();

        if (isSuccess && response) {
            this.IDROLPASSPORT = response?.rolPassport?.idRolPassport;
            this.IDNIVELINSTANCIA = response?.centroTrabajo?.idNivelInstancia;
        }
    }

    async buildData() {

        let isSuccess = true;

        const response = await this.dataService.AccionesPersonal().getComboRegimenLaboral(this.IDROLPASSPORT, this.IDNIVELINSTANCIA, null).pipe(
            catchError(() => {
                isSuccess = false;
                return of([]);
            }),
            finalize(() => { })
        ).toPromise();

        if (isSuccess && response) {
            this.regimenesLaborales = response;

            const data = response.map((x) => ({
                ...x,
                value: x.idRegimenLaboral,
                label: `${x.abreviaturaRegimenLaboral}`,
            }));

            this.comboLists.listRegimenlaboral = data;
        }
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

    setRequest = () => {
        const _idRegimenLaboral = this.form.get('idRegimenLaboral').value;
        const idRegimenLaboral = _idRegimenLaboral !== -1 ? _idRegimenLaboral : null;
        const centroTrabajo = this.form.get('centroTrabajo').value;
        const codigoCentroTrabajo = this.form.get('codigoCentroTrabajo').value;

        const { codigoSede, codigoTipoSede } = this.entidadSedeService.entidadSede;

        this.request = {
            codigoTipoSede,
            codigoSede,
            codigoPlaza: this.form.get('codigoPlaza').value,
            idRegimenLaboral,
            centroTrabajo,
            codigoCentroTrabajo,
            // idRolPassport: this.idRolPassport,
            // descripcion:this.form.get('descripcion').value,
            paginaActual: 1,
            tamanioPagina: 10
        };
    }

    buscar() {

        const form = this.form.value;
        if (form.codigoPlaza || form.centroTrabajo || form.codigoCentroTrabajo || form.idRegimenLaboral != -1) {
            this.setRequest();
            this.dataSource.load(this.request,
                this.paginator.pageIndex + 1,
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

    constructor(private dataService: DataService, private _matPaginator: MatPaginator) {
        super();
    }

    load(data: any, pageIndex: number, pageSize: number) {
        this._totalRows = 0;
        this._dataChange.next([]);

        if (!data) {
            return;
        }

        this._loadingChange.next(true);
        let isSuccess = true;

        Object.keys(data)?.forEach(key => {
            if (data[key] === null) {
                delete data[key];
            }
        });

        const _response = this.dataService.AccionesPersonal().buscarPlaza(data, pageIndex, pageSize).pipe(
            catchError(() => {
                isSuccess = false;
                return of([]);
            }),
            finalize(() => this._loadingChange.next(false))
        ).toPromise();

        _response.then(response => {
            if (isSuccess && response) {
                this._totalRows = (response[0])?.totalregistro;
                this._dataChange.next(response);
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
