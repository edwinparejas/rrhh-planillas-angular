import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { GlobalsService } from 'app/core/shared/globals.service';
import { TipoDocumentoIdentidadEnum } from '../../_utils/constants';

@Component({
    selector: 'minedu-buscar-familiar-servidor',
    templateUrl: './buscar-familiar-servidor.component.html',
    styleUrls: ['./buscar-familiar-servidor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscarFamiliarServidorComponent implements OnInit, OnDestroy, AfterViewInit {
    private dataSubscription: Subscription;
    private _loadingChange = new BehaviorSubject<boolean>(false);

    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;
    maxLengthnumeroDocumentoIdentidad: number;
    working: false;
    form: FormGroup;

    dataSource: FamiliarServidorDataSource | null;
    selection = new SelectionModel<any>(true, []);

    /*     paginatorPageSize = 10;
        paginatorPageIndex = 1; */
    seleccionado: any = null;
    idPersona: any;

    comboLists = {
        listTipoDocumento: []
    };

    request = {
        idPersona: null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        primerApellido: null,
        segundoApellido: null,
        nombres: null
    };

    displayedColumns: string[] = [
        'numeroDocumentoIdentidad',
        'nombreCompleto',
        'fechaNacimiento',
        'descripcionParentesco'
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    isMobile = false;
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
        public matDialogRef: MatDialogRef<BuscarFamiliarServidorComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog) {
        this._unsubscribeAll = new Subject();
        this.idPersona = data.idPersona;
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
    }

    ngOnDestroy(): void {

    }

    ngOnInit(): void {
        this.buildForm();
        this.handleResponsive();
        this.loadTipoDocumentoIdentidad();
        this.dataSource = new FamiliarServidorDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    loadData = (pageIndex, pageSize) => {
        this.request = {
            idPersona: this.idPersona,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad'),
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad'),
            primerApellido: this.form.get('primerApellido'),
            segundoApellido: this.form.get('segundoApellido'),
            nombres: this.form.get('nombres')
        };
        this.dataSource.load(this.request, pageIndex, pageSize);
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            primerApellido: [null],
            segundoApellido: [null],
            nombres: [null],
        });
    }

    loadTipoDocumentoIdentidad = () => {
        this.dataService.Licencias().getComboTiposDocumento().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.abreviaturaCatalogoItem}`
                }));
                this.comboLists.listTipoDocumento = data;
            }
        });
    }

    cargarFiltro(): void {
        this.request = this.form.getRawValue();
    }

    buscarServidorPublico = () => {
        this.cargarFiltro();
        this.request.idPersona = this.idPersona;
        if (this.request.idTipoDocumentoIdentidad != null && this.request.numeroDocumentoIdentidad == null) {
            this.dataService.Message().msgWarning('Debe ingresar Número de documento.', () => { });
            return;
        }

        if (this.request.idTipoDocumentoIdentidad == null && this.request.numeroDocumentoIdentidad != null) {
            this.dataService.Message().msgWarning('Debe ingresar Tipo de documento.', () => { });
            return;
        }

        if (this.request.idTipoDocumentoIdentidad === null &&
            this.request.numeroDocumentoIdentidad === null &&
            this.request.nombres === null &&
            this.request.primerApellido === null &&
            this.request.segundoApellido === null) {
            this.dataService.Message().msgWarning('Debe especificar por lo menos un criterio de búsqueda.', () => { });
        } else {
            this.dataSource = new FamiliarServidorDataSource(this.dataService);
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
        }
    }

    handleLimpiar(): void {
        this.form.reset();
    }

    handleBuscar(): void {
        this.buscarServidorPublico();
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        this.seleccionado = selected;
    }

    handleSelect = (form) => {
        if (this.seleccionado === null) {
            this.dataService.Message().msgWarning('Debe seleccionar un registro.', () => { });
        } else {
            this.matDialogRef.close({ familiarServidor: this.seleccionado });
        }
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get('numeroDocumentoIdentidad').setValue('');
        this.maxLengthnumeroDocumentoIdentidad =

            tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;

        this.form
            .get('numeroDocumentoIdentidad')
            .setValidators([
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),
            ]);

    }

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    }
}

export class FamiliarServidorDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(true);

        if (data.codigoModular === null && data.codigoPlaza === null && data.idRegimenLaboral === null && data.idCargo === null && data.numeroDocumentoReferencia === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Licencias().getFamiliarServidorPublico(data, pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => this._loadingChange.next(false))
            ).subscribe((response: any) => {
                this._dataChange.next(response.data || []);
                this.totalregistro = ((response.data || []).length === 0) ? 0 : response.data[0].totalRegistro;
                if ((response.data || []).length === 0) {
                    this.dataService.Message().msgWarning('No se encontró información de la(s) servidor(es) para los criterios de búsqueda ingresados.', () => { });
                }
            });
        }

        this._dataChange.next(data);
        this.totalregistro = 0;
    }
    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get data(): any {
        return this._dataChange.value || [];
    }
}