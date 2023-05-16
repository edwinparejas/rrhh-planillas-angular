import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { MatPaginator } from '@angular/material/paginator';
import { of, Observable, BehaviorSubject, Subject } from 'rxjs';
import { GlobalsService } from 'app/core/shared/globals.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TipoDocumentosIdentidadActivoEnum } from '../../types/Enums';
import { RegexPatterns } from '../../Utils/regexPatterns';
import { MESSAGE_GESTION } from '../../Utils/constants';

@Component({
    selector: 'minedu-buscar-persona',
    templateUrl: './buscar-persona.component.html',
    styleUrls: ['./buscar-persona.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscarPersonaComponent implements OnInit, AfterViewInit, OnDestroy {
    working: false;
    form: FormGroup;
    maxLengthnumeroDocumentoIdentidad: number;
    dataSource: ServidorPublicoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    seleccionado: any = null;
    currentSession: SecurityModel = new SecurityModel();
    comboLists = {
        listTipoDocumento: []
    };

    request = {
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        primerApellido: null,
        segundoApellido: null,
        nombres: null
    };

    displayedColumns: string[] = [
        'index',
        'nro',
        'numeroDocumentoIdentidadCompleto',
        'nombreCompleto',
        'fechaNacimiento',
        'edad',
        'nacionalidad',
        'estadoCivil',
        'estado'
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    isMobile = false;


    private _unsubscribeAll: Subject<any>;

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
        public matDialogRef: MatDialogRef<BuscarPersonaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService) {

        this._unsubscribeAll = new Subject();
    }
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngAfterViewInit(): void {
        this.paginator.page.pipe(tap(() => this.buscarServidorPublico())).subscribe();
    }

    ngOnInit(): void {
        this.buildForm();
        this.buildSeguridad();
        this.handleResponsive();
        this.loadTipoDocumentoIdentidad();
        this.dataSource = new ServidorPublicoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) { return `0 de ${length}`; }
            const length2 = Math.max(length, 0);
            const startIndex = page * pageSize;
            const endIndex = startIndex < length2 ? Math.min(startIndex + pageSize, length2) : startIndex + pageSize;
            return `${startIndex + 1} – ${endIndex} de ${length2}`;
        }

        if (this.data.idTipoDocumentoIdentidad) this.form.controls["idTipoDocumentoIdentidad"].setValue(this.data.idTipoDocumentoIdentidad);
        if (this.data.numeroDocumentoIdentidad) this.form.controls["numeroDocumentoIdentidad"].setValue(this.data.numeroDocumentoIdentidad);

        this.cargaInicial();
    }

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        console.log("codigos Sede", this.currentSession.idSede, this.currentSession.idTipoSede, this.currentSession.codigoLocalSede, this.currentSession.codigoPadreSede)
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

        this.dataSource.load(this.request, pageIndex, pageSize);
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [-1],
            numeroDocumentoIdentidad: [null],
            primerApellido: [null],
            segundoApellido: [null],
            nombres: [null],
        });

        this.form.get("numeroDocumentoIdentidad").disable();


        this.form.get("idTipoDocumentoIdentidad").valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.validarTipoDoc(value);
            });
    }

    loadTipoDocumentoIdentidad = () => {

        let request = {
            codigoCatalogo: 6,
            activo: 1
        }
        this.dataService.AccionesPlazaEspejo().getCatalogoItem(request).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response) {
                const data = response.map(x => ({
                    ...x,
                    value: x.id,
                    label: `${x.descripcion}`
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

        if ((this.form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.CARNET_EXTRANJERIA ||
            this.form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.PASAPORTE) &&
            !this.form.get('numeroDocumentoIdentidad').valid) {

            const errorMessage = MESSAGE_GESTION.EX08;
            this.dataService.Message().msgWarning(`"${errorMessage}"`);
            return;
        }

        if (this.form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.DNI &&
            !this.form.get('numeroDocumentoIdentidad').valid) {
            const errorMessage = MESSAGE_GESTION.EX03;
            this.dataService.Message().msgWarning(`"${errorMessage}"`);
            return;
        }

        if (this.request.numeroDocumentoIdentidad === '') this.request.numeroDocumentoIdentidad = null;

        if (this.request.idTipoDocumentoIdentidad === -1 &&
            this.request.numeroDocumentoIdentidad === null &&
            this.request.nombres === null &&
            this.request.primerApellido === null &&
            this.request.segundoApellido === null) {
            this.dataService.Message().msgWarning('"DEBE ESPECIFICAR POR LO MENOS UN CRITERIO DE BÚSQUEDA."', () => { });
        } else {
            this.dataSource = new ServidorPublicoDataSource(this.dataService);

            const request = {
                idTipoDocumentoIdentidad: this.request.idTipoDocumentoIdentidad == -1 ? null : this.request.idTipoDocumentoIdentidad,
                numeroDocumentoIdentidad: this.request.numeroDocumentoIdentidad,
                nombres: this.request.nombres,
                primerApellido: this.request.primerApellido,
                segundoApellido: this.request.segundoApellido,
                idDre: this.data.idDre,
                idUgel: this.data.idUgel
            };

            this.dataSource.load(request, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
        }
    }

    private async cargaInicial() {

        console.log(this.form.value);
        console.log(this.form.valid);

        this.cargarFiltro();

        if (this.form.get('idTipoDocumentoIdentidad').value == -1) return;

        if ((this.form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.CARNET_EXTRANJERIA ||
            this.form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.PASAPORTE) &&
            !this.form.get('numeroDocumentoIdentidad').valid) {
            return;
        }

        if (this.form.get('idTipoDocumentoIdentidad').value == TipoDocumentosIdentidadActivoEnum.DNI &&
            !this.form.get('numeroDocumentoIdentidad').valid) {
            return;
        }

        const request = {
            idTipoDocumentoIdentidad: this.request.idTipoDocumentoIdentidad == -1 ? null : this.request.idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad: this.request.numeroDocumentoIdentidad,
            idDre: this.data.idDre,
            idUgel: this.data.idUgel
        };

        await this.dataSource.load(request, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);

        if(this.dataSource?.data[0]){
            this.onSelect(this.dataSource?.data[0]);
        }
    }

    onKeyPressNumeroDocumento(e: any): boolean {
        const tiposDocumento = this.comboLists.listTipoDocumento;
        const _tipoDocumento = this.form.get('idTipoDocumentoIdentidad').value;

        const tipoDocumentoSelect = tiposDocumento.find(m => m.id_catalogo_item == _tipoDocumento);

        if (tipoDocumentoSelect?.codigo_catalogo_item == TipoDocumentosIdentidadActivoEnum.DNI) {
            //------------ DNI
            const reg = /^\d+$/;
            const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
            if (!reg.test(pressedKey)) {
                e.preventDefault();
                return false;
            }
        } else {
            //------------ PASAPORTE O CARNET DE EXTRANJERIA
            var inp = String.fromCharCode(e.keyCode);

            if (/[a-zA-Z0-9]/.test(inp)) {
                return true;
            } else {
                e.preventDefault();
                return false;
            }
        }
    }

    private validarTipoDoc(tipoDoc: number) {

        let regExpr: RegExp = null;

        this.form.patchValue({ numeroDocumentoIdentidad: null });
        this.form.get("numeroDocumentoIdentidad").enable();

        switch (tipoDoc) {
            case TipoDocumentosIdentidadActivoEnum.DNI:
                regExpr = RegexPatterns.DNI;
                this.maxLengthnumeroDocumentoIdentidad = 8;
                break;
            case TipoDocumentosIdentidadActivoEnum.PASAPORTE:
                regExpr = RegexPatterns.PASAPORTE;
                this.maxLengthnumeroDocumentoIdentidad = 12;
                break;
            case TipoDocumentosIdentidadActivoEnum.CARNET_EXTRANJERIA:
                regExpr = RegexPatterns.CARNET_EXTRANJERIA;
                this.maxLengthnumeroDocumentoIdentidad = 12;
                break;
            case -1:
                this.form.get("numeroDocumentoIdentidad").disable();
                break;
        }

        if (regExpr) {
            const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad");
            numeroDocumentoIdentidad.setValidators([Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad), Validators.required, Validators.pattern(regExpr)]);
            numeroDocumentoIdentidad.updateValueAndValidity();
        }
    }

    handleLimpiar(): void {
        this.form.reset();
        this.form.get("idTipoDocumentoIdentidad").setValue(-1);
        this.form.get("numeroDocumentoIdentidad").disable();

        this.dataSource._dataChange.next([]);
        this.dataSource.totalregistro = 0;
    }

    handleBuscar(): void {
        this.buscarServidorPublico();
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        this.matDialogRef.close({ servidorPublico: selected });
    }

    handleSelect = () => {
        if (this.seleccionado === null) {
            this.dataService.Message().msgWarning('"DEBE SELECCIONAR UN REGISTRO."', () => { });
        } else {
            this.matDialogRef.close({ servidorPublico: this.seleccionado });
        }
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    }

}

export class ServidorPublicoDataSource extends DataSource<any>{

    public _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    async load(data: any, pageIndex, pageSize): Promise<void> {
        this._loadingChange.next(true);

        const response = await this.dataService.AccionesPlazaEspejo().buscarServidorPublicoTransversal(data, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => {
                this._loadingChange.next(false);
            })
        ).toPromise();

        if (response?.length > 0) {
            this._dataChange.next(response || []);
            this.totalregistro = ((response || []).length === 0) ? 0 : response[0].totalRegistro;
            if ((response || []).length === 0) {
                this.dataService.Message().msgWarning(MESSAGE_GESTION.EX_FILTER_NOTFOUND, () => { });
            }
            return;
        };

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

