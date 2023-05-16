import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
// import { GlobalsService } from 'app/core/shared/globals.service';

import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SecurityModel } from 'app/core/model/security/security.model';

@Component({
    selector: 'minedu-buscador-servidor-publico',
    templateUrl: './buscador-servidor-publico.component.html',
    styleUrls: ['./buscador-servidor-publico.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscadorServidorPublicoComponent implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;

    dataSource: ServidorPublicoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    seleccionado: any = null;
    currentSession: SecurityModel = new SecurityModel();
    comboLists = {
        listTipoDocumento: []
    };

    // TODO
    request = {
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        primerApellido: null,
        segundoApellido: null,
        nombres: null
    };

    displayedColumns: string[] = [
        'numeroDocumentoIdentidadCompleto',
        'nombreCompleto',
        'fechaNacimiento',
        'edad',
        'nacionalidad',
        'estadoCivil',
        'estado'
        // 'descripcionUgel',
        // 'centroTrabajo',
        // 'abreviaturaRegimenLaboral',
        // 'situacionLaboral'
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;

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
        public matDialogRef: MatDialogRef<BuscadorServidorPublicoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog) { }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
    }
    ngOnDestroy(): void {

    }

    ngOnInit(): void {
        this.buildForm();
        this.buildSeguridad();
        this.handleResponsive();
        this.loadTipoDocumentoIdentidad();
        this.dataSource = new ServidorPublicoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'REgistros por página';
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

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    loadData(pageIndex, pageSize) {
        this.request = {

            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad'),
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad'),
            primerApellido: this.form.get('primerApellido'),
            segundoApellido: this.form.get('segundoApellido'),
            nombres: this.form.get('nombres')
        };
      this.dataSource.load(this.request,  pageIndex, pageSize);
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            primerApellido: [null],
            segundoApellido: [null],
            nombres: [null],
        });
        this.form.get("numeroDocumentoIdentidad").disable();
    }

    loadTipoDocumentoIdentidad = () => {
        this.dataService.Reasignaciones().getComboTipodocumento().pipe(
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

        if (this.request.idTipoDocumentoIdentidad != null && this.request.numeroDocumentoIdentidad == null) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR NÚMERO DE DOCUMENTO."', () => { });
            return;
        }

        if (this.request.idTipoDocumentoIdentidad == null && this.request.numeroDocumentoIdentidad != null) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR TIPO DE DOCUMENTO."', () => { });
            return;
        }

        if (this.request.idTipoDocumentoIdentidad === null &&
            this.request.numeroDocumentoIdentidad === null &&
            this.request.nombres === null &&
            this.request.primerApellido === null &&
            this.request.segundoApellido === null) {
            this.dataService.Message().msgWarning('"DEBE ESPECIFICAR POR LO MENOS UN CRITERIO DE BÚSQUEDA."', () => { });
        } else {
            this.dataSource = new ServidorPublicoDataSource(this.dataService);
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
        // TODO:
        // this.dataShared.sendDataSharedBuscarDocumento({ registro: selected });

    }

    handleSelect = (form) => {
        if (this.seleccionado === null) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR UN REGISTRO."', () => { });
        } else {
            this.matDialogRef.close({ servidorPublico: this.seleccionado });
        }
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

}

export class ServidorPublicoDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);

        if (data.codigoModular === null && data.codigoPlaza === null && data.idRegimenLaboral === null && data.idCargo === null && data.numeroDocumentoReferencia === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService.Reasignaciones().getListaServidorPublico(data, pageIndex, pageSize).pipe(
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

