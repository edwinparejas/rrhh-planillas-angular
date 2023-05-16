import {
    Component,
    OnInit,
    ViewEncapsulation,
    OnDestroy,
    AfterViewInit,
    ViewChild,
} from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import {
    FormGroup,
    FormBuilder,
    Validators,
    MaxLengthValidator,
} from '@angular/forms';
import {
    SelectionModel,
    DataSource,
    CollectionViewer,
} from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { finalize, catchError } from 'rxjs/operators';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import { BuscarCentroTrabajoComponent } from '../../../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { TipoDocumentoIdentidadEnum } from '../../../_utils/constants';
import { TablaPermisos } from '../../../../../../core/model/types';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { CentroTrabajoModel } from '../../../../../../core/model/centro-trabajo.model';
import { BuscadorServidorPublicoComponent } from '../../../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { OpcionFiltro } from '../../../models/licencia.model';
import { MatExpansionPanelActionRow } from '@angular/material/expansion';

@Component({
    selector: 'minedu-bandeja-control-licencias',
    templateUrl: './bandeja-control-licencias.component.html',
    styleUrls: ['./bandeja-control-licencias.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaControlLicenciasComponent
    implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    loading: false;
    export = false;
    comboLists = {
        listAnio: [],
        listTipoDocumento: [],
        listRegimenLaboral: [],
        listSituacionLaboral: [],
    };
    dataSource: LicenciaOtrasDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    maxLengthnumeroDocumentoIdentidad = 8;

    @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    dialogRef: any;
    panelOpenState = false;
    currentSession: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;

    request = {
        idDre: null,
        idUgel: null,
        anio: new Date().getFullYear(),
        idTipoDocumentoIdentidad: TipoDocumentoIdentidadEnum.DNI,
        numeroDocumentoIdentidad: null,
        idRegimenLaboral: null,
        codigoCentroTrabajo: null,
        idSituacionLaboral: null,
    };

    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false
    };

    displayedColumns: string[] = [
        'registro',
        'numeroDocumentoIdentidadCompleto',
        'nombreCompleto',
        'regimenLaboral',
        'centroTrabajo',
        'descripcionSituacionLaboral',
        'cantidadDiasSgRegistrado',
        'cantidadDiasSgEnProyecto',
        'cantidadDiasSgEnResolucion',
        'cantidadDiasSg',
        'cantidadDiasCgRegistrado',
        'cantidadDiasCgEnProyecto',
        'cantidadDiasCgEnResolucion',
        'cantidadDiasCg',
        'acciones',
    ];

    now = new Date();
    minDate = new Date('July 21, 1890 01:15:00');
    untilDate = new Date();
    opcionFiltro: OpcionFiltro = new OpcionFiltro();

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
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        // public globals: GlobalsService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.buildForm();
        this.handleResponsive();
        this.buildSeguridad();
        this.loadTipoDocumentoIdentidad();
        this.loadRegimenLaboral();
        this.loadSituacionlaboral();
        this.dataSource = new LicenciaOtrasDataSource(this.dataService);

        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';

        this.resetForm();
        this.loadCentroTrabajo();
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
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

    buildForm(): void {
        this.form = this.formBuilder.group({
            anio: [null, Validators.required],
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            idRegimenLaboral: [null],
            codigoCentroTrabajo: [null],
            idSituacionLaboral: [null],
        });

        this.form.get('anio').setValue(new Date());
    }

    resetForm = () => {
        this.form.reset();
        this.form.get('idTipoDocumentoIdentidad').setValue(this.opcionFiltro.item.value);
        this.maxLengthnumeroDocumentoIdentidad = 8;
        this.form.get('anio').setValue(new Date());
        this.form.get('idRegimenLaboral').setValue(this.opcionFiltro.item.value);
        this.form.get('idSituacionLaboral').setValue(this.opcionFiltro.item.value);
    }

    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        // this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = true;
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
                    this.buscarControlLicencias();
                }
            });
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

    setRequest = () => {
        this.request = {
            idDre: null,
            idUgel: null,
            anio: this.form.get('anio').value.getFullYear(),
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            idRegimenLaboral: this.form.get('idRegimenLaboral').value,
            codigoCentroTrabajo: this.form.get('codigoCentroTrabajo').value,
            idSituacionLaboral: this.form.get('idSituacionLaboral').value,
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

    handleLimpiar(): void {
        this.resetForm();
    }

    handleBuscar(): void {
        this.buscarControlLicencias();
    }

    handleExportar = () => {

        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning('No se encontró información para para exportar.', () => { });
            return;
        }

        this.export = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Licencias()
            .exportarListaLicenciasResumen(
                this.request,
                1,
                this.dataSource.dataTotal
            )
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                    this.export = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    saveAs(response, this.request.anio + '_Control_licencias.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'No se encontró información para los criterios de búsqueda ingresados.',
                            () => { }
                        );
                }
            });
    };

    handleGestionar = (row: any, i) => {
        this.router.navigate(['./registralicencia/' + row.idServidorPublico], { relativeTo: this.route });
    }

    loadTipoDocumentoIdentidad = () => {
        this.dataService
            .Licencias()
            .getComboTiposDocumento()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTipoDocumento = data;
                    this.comboLists.listTipoDocumento.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label })
                }
            });
    };

    loadRegimenLaboral = () => {
        this.dataService
            .Licencias()
            .getRegimenLaboral(null)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idRegimenLaboral,
                        label: `${x.abreviaturaRegimenLaboral}`,
                    }));
                    this.comboLists.listRegimenLaboral = data;
                    this.comboLists.listRegimenLaboral.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label })
                }
            });
    };

    busquedaPersonalizada(): void {
        this.dialogRef = this.materialDialog.open(
            BuscadorServidorPublicoComponent,
            {
                panelClass: 'minedu-buscador-servidor-publico-dialog',
                width: '1080px',
                disableClose: true,
                data: {
                    action: 'busqueda',
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const servidorPublico = resp.servidorPublico;
                this.form.get('idTipoDocumentoIdentidad').setValue(servidorPublico.idTipoDocumentoIdentidad);
                this.form.get('numeroDocumentoIdentidad').setValue(servidorPublico.numeroDocumentoIdentidad);
            }
        });
    }

    busquedaCentroTrabajo = () => {
        this.dialogRef = this.materialDialog.open(BuscarCentroTrabajoComponent, {
            panelClass: 'buscar-centro-trabajo-dialog',
            width: '1000px',
            disableClose: true,
            data: {
                action: 'requerimiento',
            }
        });

        this.dialogRef.afterClosed().subscribe(result => {
            if (result != null) {
                this.form.get('codigoCentroTrabajo').setValue(result.centroTrabajo.codigoCentroTrabajo);
            }
        });
    }

    buscarControlLicencias = () => {
        this.setRequest();
        if (this.request.idTipoDocumentoIdentidad == -1 && this.request.numeroDocumentoIdentidad != null) {
            this.dataService.Message().msgWarning('Debe ingresar Tipo de documento.', () => { });
            return;
        }
        if (this.request.anio === null) {
            this.dataService
                .Message()
                .msgWarning(
                    'Debe especificar por lo menos un criterio de búsqueda.',
                    () => { }
                );
        } else {
            this.dataSource = new LicenciaOtrasDataSource(this.dataService);
            this.dataSource.load(
                this.request,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize
            );
        }
    };

    loadSituacionlaboral = () => {
        this.dataService
            .Licencias()
            .getSituacionLaboral(null)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listSituacionLaboral = data;
                    this.comboLists.listSituacionLaboral.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label })
                }
            });
    };
}

export class LicenciaOtrasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);

        if (data.anio === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Licencias()
                .getListaLicenciasResumen(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => this._loadingChange.next(false))
                )
                .subscribe((response: any) => {
                    this._dataChange.next(response.data || []);
                    this.totalregistro =
                        (response.data || []).length === 0
                            ? 0
                            : response.data[0].totalregistro;
                    if ((response.data || []).length === 0) {
                        this.dataService
                            .Message()
                            .msgWarning(
                                'No se encontró información de la(s) licencia(s) para los criterios de búsqueda ingresados.',
                                () => { }
                            );
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
