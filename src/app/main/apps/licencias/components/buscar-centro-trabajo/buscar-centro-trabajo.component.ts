import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { Subscription, BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { TablaNivelInstancia, TablaTipoCentroTrabajo } from 'app/core/model/types';

import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { PassportModel } from 'app/core/model/passport-model';

@Component({
    selector: 'minedu-buscar-centro-trabajo',
    templateUrl: './buscar-centro-trabajo.component.html',
    styleUrls: ['./buscar-centro-trabajo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BuscarCentroTrabajoComponent implements OnInit, OnDestroy, AfterViewInit {

    private dataSubscription: Subscription;
    private _loadingChange = new BehaviorSubject<boolean>(false);

    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;

    form: FormGroup;
    working = false;
    dialogTitle: string;
    action: string;

    dialogRef: any;

    instancias: any[];
    subinstancias: any[];
    tiposCentroTrabajo: any[];

    filtro = {
        idNivelInstancia: null,
        idInstancia: null,
        idSubinstancia: null,
        idTipoCentroTrabajo: null,
        institucionEducativa: null
    };

    private passport: PassportModel = { idNivelInstancia: null, idEntidad: null, usuario: null };

    ocultarInstancia = false;
    ocultarSubinstancia = false;
    ocultarTipoCentroTrabajo = false;
    ocultarInstitucionesEducativas = false;

    tieneEstructuraOrganica = null;

    displayedColumns: string[] = ['index', 'idCentroTrabajo', 'codigoCentroTrabajo', 'id', 'centroTrabajo', 'instancia', 'subinstancia', 'idTipoCentroTrabajo', 'tipoCentroTrabajo'];

    dataSource: CentroTrabajoDataSource | null;
    selection = new SelectionModel<any>(false, []);
    @ViewChild('paginatorCentroTrabajo', { static: true }) paginator: MatPaginator;

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
        public matDialogRef: MatDialogRef<BuscarCentroTrabajoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        public globals: GlobalsService,
        private materialDialog: MatDialog
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.action = this.data.action;
        this.dialogTitle = 'Búsqueda de centro de trabajo';

        this.buildForm();
        this.handleResponsive();
        this.buildData();
        this.dataSource = new CentroTrabajoDataSource(this.dataService);
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

    buildForm() {
        this.form = this.formBuilder.group({
            idNivelInstancia: [null],
            idInstancia: [null],
            idSubinstancia: [null],
            idTipoCentroTrabajo: [null],
            institucionEducativa: [null]
        });

        this.passport.idNivelInstancia = 12;
        this.passport.idEntidad = 1;

        this.form.get('idInstancia').valueChanges.subscribe(value => {
            let idNivelInstancia = null;
            let idInstancia = null;

            this.subinstancias = [];
            this.tiposCentroTrabajo = [];

            if (value === '-1') {
                switch (this.passport.idNivelInstancia) {
                    case TablaNivelInstancia.MINEDU: {
                        this.mostrarOpciones(true, false, false, false);
                        break;
                    }
                }
                return;
            }

            if (this.instancias.length !== 0 && value !== null && value !== undefined) {
                const data = this.instancias.find(x => x.idInstancia === value);
                idNivelInstancia = parseInt(value.split('-')[0])
                idInstancia = data.id;
            }

            this.form.patchValue({ idSubinstancia: '-1', idTipoCentroTrabajo: '-1' });

            switch (idNivelInstancia) {
                case TablaNivelInstancia.MINEDU: {
                    if (value) {
                        this.mostrarOpciones(true, false, true, false);
                        this.loadTipoCentroTrabajo(idNivelInstancia, true);
                    }
                    break;
                }
                case TablaNivelInstancia.DRE: {
                    if (value) {
                        this.mostrarOpciones(true, true, false, false);
                        this.loadSubinstancia(idInstancia, true);
                    }
                    break;
                }
            }
        });

        this.form.get('idSubinstancia').valueChanges.subscribe(value => {
            let idNivelInstancia = null;
            let idSubinstancia = null;

            this.tiposCentroTrabajo = [];

            if (value === '-1') {
                switch (this.passport.idNivelInstancia) {
                    case TablaNivelInstancia.MINEDU: {
                        this.mostrarOpciones(true, true, false, false);
                        break;
                    }
                    case TablaNivelInstancia.DRE: {
                        this.mostrarOpciones(false, true, false, false);
                        break;
                    }
                }
                return;
            }

            if (this.subinstancias.length !== 0 && value !== null && value !== undefined) {
                const data = this.subinstancias.find(x => x.idSubinstancia === value);
                idNivelInstancia = parseInt(value.split('-')[0].toString());
                idSubinstancia = data.id;
            }

            this.form.patchValue({ idTipoCentroTrabajo: '-1' });

            switch (this.passport.idNivelInstancia) {
                case TablaNivelInstancia.MINEDU: {
                    if (value) {
                        this.mostrarOpciones(true, true, true, false);
                        this.loadTipoCentroTrabajo(idNivelInstancia, true);
                    }
                    break;
                }
                case TablaNivelInstancia.DRE: {
                    if (value) {
                        this.mostrarOpciones(false, true, true, false);
                        this.loadTipoCentroTrabajo(idNivelInstancia, true);
                    }
                    break;
                }
                case TablaNivelInstancia.UGEL: {
                    if (value) {
                        this.mostrarOpciones(false, false, true, false);
                        this.loadTipoCentroTrabajo(idNivelInstancia, true);
                    }
                    break;
                }
            }
        });

        this.form.get('idTipoCentroTrabajo').valueChanges.subscribe(value => {
            if (value === '-1') {
                switch (this.passport.idNivelInstancia) {
                    case TablaNivelInstancia.MINEDU: {
                        this.mostrarOpciones(true, true, true, false);
                        break;
                    }
                    case TablaNivelInstancia.DRE: {
                        this.mostrarOpciones(false, true, true, false);
                        break;
                    }
                    case TablaNivelInstancia.UGEL: {
                        this.mostrarOpciones(false, false, true, false);
                        break;
                    }
                }
                return;
            }

            let idTipoCentroTrabajo = null;
            this.form.controls['institucionEducativa'].setValue('');

            if (this.tiposCentroTrabajo.length !== 0 && value !== null && value !== undefined) {
                const data = this.tiposCentroTrabajo.find(x => x.idTipoCentroTrabajo === value);
                idTipoCentroTrabajo = data.idTipoCentroTrabajo;
                this.tieneEstructuraOrganica = data.tieneEstructuraOrganica;
            }

            switch (this.passport.idNivelInstancia) {
                case TablaNivelInstancia.MINEDU: {
                    if (value && value > 0) {
                        if (this.tieneEstructuraOrganica === true) {
                            if (idTipoCentroTrabajo === TablaTipoCentroTrabajo.Minedu) {
                                this.mostrarOpciones(true, false, true, false);
                            } else {
                                this.mostrarOpciones(true, true, true, false);
                            }
                        } else {
                            this.mostrarOpciones(true, true, true, true);
                        }
                    }
                    break;
                }
                case TablaNivelInstancia.DRE: {
                    if (value && value > 0) {
                        if (this.tieneEstructuraOrganica === true) {
                            this.mostrarOpciones(false, true, true, false);
                        } else {
                            this.mostrarOpciones(false, true, true, true);
                        }
                    }
                    break;
                }
                case TablaNivelInstancia.UGEL: {
                    if (value && value > 0) {
                        if (this.tieneEstructuraOrganica === true) {
                            this.mostrarOpciones(false, false, true, false);
                        } else {
                            this.mostrarOpciones(false, false, true, true);
                        }
                    }
                    break;
                }
            }
        });
    }

    buildPassport() {
        this.passport = {
            idNivelInstancia: 12,
            idEntidad: 1,
            usuario: 'admin'
        };
    }

    buildData() {
        this.mostrar(this.passport.idNivelInstancia);

        switch (this.passport.idNivelInstancia) {
            case TablaNivelInstancia.MINEDU: {
                this.loadInstancia(true);
                break;
            }
            case TablaNivelInstancia.DRE: {
                this.loadSubinstancia(this.passport.idEntidad, true);
                break;
            }
            case TablaNivelInstancia.UGEL: {
                this.loadTipoCentroTrabajo(this.passport.idNivelInstancia, true);
                break;
            }
        }
    }

    default() {
        this.form.patchValue({
            idInstancia: '-1', idSubinstancia: '-1', idTipoCentroTrabajo: '-1'
        });

        this.form.controls['institucionEducativa'].reset();
    }

    ngAfterViewInit() {
        this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
    }

    loadData(pageIndex, pageSize) {
        this.dataSource.load(this.filtro, pageIndex, pageSize);
    }

    ngOnDestroy(): void {
    }

    loadInstancia(activo) {
        this.dataService.Licencias().getInstancia(activo).pipe(
            catchError(() => of([])),
            map((response: any) => response)
        ).subscribe(response => {
            if (response && response.result) {
                this.instancias = response.data;
                this.form.controls['idInstancia'].setValue('-1');
            }
        });
    }

    loadSubinstancia(idInstancia, activo) {
        this.dataService.Licencias().getSubinstancia(idInstancia, activo).pipe(
            catchError(() => of([])),
            map((response: any) => response)
        ).subscribe(response => {
            if (response && response.result) {
                this.subinstancias = response.data;
                this.form.controls['idSubinstancia'].setValue('-1');
            }
        });
    }

    loadTipoCentroTrabajo(idNivelInstancia, activo) {
        this.dataService.Licencias().getTipoCentroTrabajo(idNivelInstancia, activo).pipe(
            catchError(() => of([])),
            map((response: any) => response)
        ).subscribe(response => {
            if (response && response.result) {
                this.tiposCentroTrabajo = response.data;
                if (this.tiposCentroTrabajo.length === 1) {
                    this.form.controls['idTipoCentroTrabajo'].setValue(this.tiposCentroTrabajo[0].idTipoCentroTrabajo);
                    this.form.controls['idTipoCentroTrabajo'].disable();
                } else {
                    this.form.controls['idTipoCentroTrabajo'].setValue('-1');
                    this.form.controls['idTipoCentroTrabajo'].enable();
                }
            }
        });
    }

    cancelar() {
        this.resetFiltro();
        this.matDialogRef.close();
    }

    buscar() {
        this.setFiltro();
        if (this.form.value.idInstancia === '-1') {
            this.dataService.Message().msgWarning('Debe ingresar al menos un criterio de búsqueda.', () => { });
            return;
        }

        this.dataSource.load(this.filtro, (this.paginator.pageIndex + 1), this.globals.paginatorPageSize);
    }

    setFiltro() {
        const data = this.form.getRawValue();
        this.resetFiltroBuscar();

        if (data.idInstancia !== null && data.idInstancia !== '-1') {
            this.filtro.idNivelInstancia = parseInt(data.idInstancia.split('-')[0]);
            this.filtro.idInstancia = parseInt(data.idInstancia.split('-')[1]);
        }

        if (data.idSubinstancia !== null && data.idSubinstancia !== '-1') {
            this.filtro.idNivelInstancia = parseInt(data.idSubinstancia.split('-')[0]);
            this.filtro.idSubinstancia = parseInt(data.idSubinstancia.split('-')[1]);
        }

        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
            this.filtro.idTipoCentroTrabajo = data.idTipoCentroTrabajo;
        }

        switch (this.passport.idNivelInstancia) {
            case TablaNivelInstancia.MINEDU:
            case TablaNivelInstancia.DRE: {
                this.filtro.idInstancia = this.filtro.idInstancia ? this.filtro.idInstancia : this.passport.idEntidad;
                break;
            }
            case TablaNivelInstancia.UGEL: {
                if (data.idSubinstancia === null) {
                    this.filtro.idNivelInstancia = this.passport.idNivelInstancia;
                    this.filtro.idSubinstancia = this.passport.idEntidad;
                }
                break;
            }
        }

        this.filtro.institucionEducativa = data.institucionEducativa ? data.institucionEducativa : null;
    }

    onSelect(selected: any): void {
        this.selection.clear();
        this.selection.toggle(selected);
        // this.dataShared.sendDataSharedCentroTrabajo({ registro: selected });
        this.matDialogRef.close({ centroTrabajo: selected });
    }

    mostrar(idNivelInstancia) {
        this.resetearOpciones();

        switch (idNivelInstancia) {
            case TablaNivelInstancia.MINEDU: {
                this.ocultarInstancia = true;
                break;
            }
            case TablaNivelInstancia.DRE: {
                this.ocultarSubinstancia = true;
                break;
            }
            case TablaNivelInstancia.UGEL: {
                this.ocultarTipoCentroTrabajo = true;
                break;
            }
        }
    }

    mostrarOpciones(instancia, subinstancia, tipoCentroTrabajo, InstitucionEducativa) {
        this.ocultarInstancia = instancia;
        this.ocultarSubinstancia = subinstancia;
        this.ocultarTipoCentroTrabajo = tipoCentroTrabajo;
        this.ocultarInstitucionesEducativas = InstitucionEducativa;
    }

    resetearOpciones() {
        this.ocultarInstancia = false;
        this.ocultarSubinstancia = false;
        this.ocultarTipoCentroTrabajo = false;
        this.ocultarInstitucionesEducativas = false;
    }

    resetFiltro() {
        this.form.clearValidators();
        this.default();
    }

    resetFiltroBuscar() {
        this.filtro = {
            idNivelInstancia: null,
            idInstancia: null,
            idSubinstancia: null,
            idTipoCentroTrabajo: null,
            institucionEducativa: null
        };
    }
}

export class CentroTrabajoDataSource extends DataSource<any>{

    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(filtro: any, pageIndex, pageSize) {
        this._loadingChange.next(true);
        this.dataService.Licencias().listarCentroTrabajo(filtro, pageIndex, pageSize).pipe(
            catchError(() => of([])),
            finalize(() => this._loadingChange.next(false))
        ).subscribe((response: any) => {
            this._dataChange.next(response.data || []);
            this.totalregistro = (response.data || []).length === 0 ? 0 : response.data[0].totalRegistro;
            if ((response.data || []).length === 0) { this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresados.', () => { }); }
        });
        this._dataChange.next(filtro);
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
