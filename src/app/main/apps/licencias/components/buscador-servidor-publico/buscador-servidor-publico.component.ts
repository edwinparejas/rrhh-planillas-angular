import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize} from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';

import { MatPaginator } from '@angular/material/paginator';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { CentroTrabajoModel } from '../../../../../core/model/centro-trabajo.model';
import { GlobalsService } from 'app/core/shared/globals.service';
import { TablaTipoDocumentoConfiguracion } from 'app/core/model/types';
import { MESSAGE_LICENCIAS } from '../../_utils/messages';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'minedu-buscador-servidor-publico',
    templateUrl: './buscador-servidor-publico.component.html',
    styleUrls: ['./buscador-servidor-publico.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscadorServidorPublicoComponent implements OnInit, OnDestroy, AfterViewInit {
    working: boolean;
    form: FormGroup;
    maxLengthnumeroDocumentoIdentidad: number;
    longitudDocumentoExacta: boolean = false;
    dataSource: ServidorPublicoDataSource | null;
    selection = new SelectionModel<any>(true, []);
    currentSession: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;
    seleccionado: any = null;

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
        'registro',
        'numeroDocumentoIdentidadCompleto',
        'nombreCompleto',
        'fechaNacimiento',
        'edad',
        'nacionalidad',
        'estadoCivil',
        'estado'
    ];

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    constructor(
        public matDialogRef: MatDialogRef<BuscadorServidorPublicoComponent>,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService) {
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
        this.buildForm();
        this.buildSeguridad();
        this.loadTipoDocumentoIdentidad();
        this.loadCentroTrabajo();
        this.dataSource = new ServidorPublicoDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
    }

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    loadCentroTrabajo = () => {
        const codigoCentroTrabajo = this.currentSession.codigoSede;
        this.dataService
            .Licencias()
            .getCentroTrabajoByCodigo(codigoCentroTrabajo, true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.centroTrabajo = response.data;
                }
            });
    }

    loadData(pageIndex, pageSize) {
        this.request = {
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            primerApellido: this.form.get('primerApellido').value,
            segundoApellido: this.form.get('segundoApellido').value,
            nombres: this.form.get('nombres').value
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
        
        this.form.get("idTipoDocumentoIdentidad").valueChanges.subscribe(value => {
            if (!value)
            return;
            this.form.get('numeroDocumentoIdentidad').setValue('');
    
            let tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(x => x.idCatalogoItem === value).codigoCatalogoItem;
    
            this.form.get('numeroDocumentoIdentidad').clearValidators();
            this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
    
            if (TablaTipoDocumentoConfiguracion.DNI === tipoDocumentoIdentidad) {
                this.maxLengthnumeroDocumentoIdentidad = 8;
                this.longitudDocumentoExacta = true;
                this.form.get('numeroDocumentoIdentidad').setValidators([Validators.compose([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern(/^[0-9]+$/)])]);
                this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
            }
    
            if (TablaTipoDocumentoConfiguracion.CE === tipoDocumentoIdentidad || 
                TablaTipoDocumentoConfiguracion.PASS === tipoDocumentoIdentidad) {
                this.maxLengthnumeroDocumentoIdentidad = 12;
                this.longitudDocumentoExacta = false;
                this.form.get('numeroDocumentoIdentidad').setValidators([Validators.compose([Validators.required, Validators.maxLength(12), Validators.minLength(9), Validators.pattern(/^[a-zA-Z0-9]+$/)])]);
                this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
            }  
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
                    label: `${x.descripcionCatalogoItem}`
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
        if (this.request.idTipoDocumentoIdentidad && !this.request.numeroDocumentoIdentidad) {
            this.dataService.Message().msgWarning('Debe ingresar Número de documento.', () => { });
            return;
        }

        if (!this.request.idTipoDocumentoIdentidad && this.request.numeroDocumentoIdentidad) {
            this.dataService.Message().msgWarning('Debe ingresar Tipo de documento.', () => { });
            return;
        }

        if (!this.request.idTipoDocumentoIdentidad &&
            !this.request.numeroDocumentoIdentidad &&
            !this.request.nombres &&
            !this.request.primerApellido &&
            !this.request.segundoApellido) {
            this.dataService.Message().msgWarning(MESSAGE_LICENCIAS.M01, () => { });
        } else {
            this.dataSource = new ServidorPublicoDataSource(this.dataService);
            this.dataSource.load(this.request, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
        }
    }

    handleLimpiar(): void {
        this.form.reset();
        this.form.get('numeroDocumentoIdentidad').clearValidators();
        this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
    }

    handleBuscar(): void {
        this.buscarServidorPublico();
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        this.seleccionado = selected;
    }

    selectedRow(row:any) {
        this.selection.clear();
        this.selection.toggle(row);
        return row;
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
            this.dataService.Licencias().busquarPersona(data, pageIndex, pageSize).pipe(
                catchError((error: HttpErrorResponse) => {
                    this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
                }),
                finalize(() => this._loadingChange.next(false))
            ).subscribe((response: any) => {
                if (response && (response || []).length > 0) {
                  this.totalregistro = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
                  this._dataChange.next(response || []);
                } else {
                  this.totalregistro = 0;
                  this._dataChange.next([]);
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

