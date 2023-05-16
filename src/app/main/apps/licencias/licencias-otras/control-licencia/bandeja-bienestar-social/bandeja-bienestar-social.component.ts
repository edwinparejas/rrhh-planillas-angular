import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import {
    SelectionModel,
    DataSource,
    CollectionViewer,
} from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { catchError, finalize } from 'rxjs/operators';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import { mineduAnimations } from '@minedu/animations/animations';
import { GenerarProyectoComponent } from '../generar-proyecto/generar-proyecto.component';
import { AccionEnum, EstadoLicenciaEnum, GrupoAccionEnum, TipoDocumentoIdentidadEnum, OrigenEliminacionEnum } from '../../../_utils/constants';
import { InformacionLicenciaComponent } from '../../../components/informacion-licencia/informacion-licencia.component';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import { CentroTrabajoModel } from '../../../../../../core/model/centro-trabajo.model';
import { BuscarCentroTrabajoComponent } from '../../../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BuscadorServidorPublicoComponent } from '../../../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { OpcionFiltro } from '../../../models/licencia.model';

@Component({
    selector: 'minedu-bandeja-bienestar-social',
    templateUrl: './bandeja-bienestar-social.component.html',
    styleUrls: ['./bandeja-bienestar-social.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaBienestarSocialComponent
    implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    loading: false;
    export = false;
    estadoLicencia = EstadoLicenciaEnum;
    dialogRef: any;

    comboLists = {
        listAnio: [],
        listTipoDocumento: [],
        listEstadoLicencia: [],
        motivoAccion: []
    };
    dataSource: LicenciaBienestarSocialDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    maxLengthnumeroDocumentoIdentidad = 8;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    panelOpenState = false;
    idGrupoAccion = GrupoAccionEnum.LICENCIAS;
    idAccion = AccionEnum.LICENCIA_CON_GOCE_DE_REMUNERACIONES;
    currentSession: SecurityModel = new SecurityModel();
    centroTrabajo: CentroTrabajoModel = null;
    opcionFiltro: OpcionFiltro = new OpcionFiltro();

    request = {
        idDre: null,
        idUgel: null,
        anio: new Date().getFullYear(),
        idTipoDocumentoIdentidad: TipoDocumentoIdentidadEnum.DNI,
        numeroDocumentoIdentidad: null,
        codigoModular: null,
        idMotivoAccion: null,
        idEstadoLicencia: null,
    };

    displayedColumns: string[] = [
        'registro',
        'numeroDocumentoIdentidad',
        'nombreCompleto',
        'descripcionCentroTrabajo',
        //        'descripcionAccion',
        'descripcionMotivoAccion',
        'fechaInicio',
        'fechaFin',
        'cantidadDias',
        'diasCargoMinedu',
        'diasCargoEssalud',
        'numeroCertificado',
        'estadoLicencia',
        'codigoResolucion',
        'acciones',
    ];

    now = new Date();

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
        this.loadMotivoAccion();
        this.loadTipoDocumentoIdentidad();
        this.loadEstadoLicencia();
        this.dataSource = new LicenciaBienestarSocialDataSource(
            this.dataService
        );
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
            idTipoDocumentoIdentidad: [null, Validators.required],
            numeroDocumentoIdentidad: [null, Validators.compose([Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),]),],
            codigoModular: [null],
            idMotivoAccion: [null],
            idEstadoLicencia: [null],
        });

        this.form.get('anio').setValue(new Date());
    }

    resetForm = () => {
        this.form.reset();
        this.form.get('idTipoDocumentoIdentidad').setValue(TipoDocumentoIdentidadEnum.DNI);
        this.maxLengthnumeroDocumentoIdentidad = 8;
        this.form.get('anio').setValue(new Date());
        this.form.get('idMotivoAccion').setValue(this.opcionFiltro.item.value);
        // this.form.get('idEstadoLicencia').setValue(this.opcionFiltro.item.value);
        this.setEstadoDefault(this.comboLists.listEstadoLicencia);
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
        // TODO:
        this.request = {
            idDre: null,
            idUgel: null,
            anio: this.form.get('anio').value.getFullYear(),
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            codigoModular: this.form.get('codigoModular').value,
            idMotivoAccion: this.form.get('idMotivoAccion').value,
            idEstadoLicencia: this.form.get('idEstadoLicencia').value,
        };
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
                    this.buscarBienestarSocial();
                }
            });
    }

    loadMotivoAccion = () => {
        const request = {
            idGrupoAccion: this.idGrupoAccion,
            idAccion: this.idAccion,
            idRegimenLaboral: null,
            codigoRolPassport: this.currentSession.codigoRol,
            activo: null
        };

        this.dataService.Licencias().getComboMotivosAccion(request).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idMotivoAccion,
                    label: `${x.descripcionMotivoAccion}`
                }));
                this.comboLists.motivoAccion = data;
                this.comboLists.motivoAccion.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });

            }
        });
    }

    loadEstadoLicencia = () => {
        this.dataService
            .Licencias()
            .getComboEstadoLicencia()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((resp: any) => {
                if (resp && resp.result) {
                    const data = resp.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                        codigoCatalogoItem: x.codigoCatalogoItem,
                    }));
                    this.comboLists.listEstadoLicencia = data;
                    this.comboLists.listEstadoLicencia.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                    this.setEstadoDefault(this.comboLists.listEstadoLicencia);
                }
            });
    }

    setEstadoDefault = (estadosLicencia: any) => {
        if (this.comboLists.listEstadoLicencia != null) {
            estadosLicencia.forEach(element => {
                if (element.codigoCatalogoItem === EstadoLicenciaEnum.ENVIADO) {
                    this.form.get('idEstadoLicencia').setValue(element.value);
                }
            });
        }
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
        if (!this.form.valid) {
            this.dataService
                .Message()
                .msgWarning(
                    'Debe especificar por lo menos un criterio de búsqueda.'
                );
            return;
        }
        this.buscarBienestarSocial();
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
            .exportarListaLicenciasBienestarResumen(
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
                    saveAs(response, this.request.anio + '_Licencias_Registrado_por_bienestar_social.xlsx');
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

    handleGestionar = (row: any, i) => {
        console.log(row);
    }

    handleGenerarProyecto = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(GenerarProyectoComponent, {
            panelClass: 'generar-proyecto-dialog',
            width: '1180px',
            disableClose: true,
            data: {
                idLicencia: row.idLicencia,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado === true) {
                this.handleBuscar();
            }
        });
    }

    handleVerProyectoResolucion = (row: any, i) => { };

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
                    this.comboLists.listTipoDocumento.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }

    buscarBienestarSocial = () => {
        this.setRequest();

        if (this.request.anio === null) {
            this.dataService
                .Message()
                .msgWarning(
                    'Debe especificar por lo menos un criterio de búsqueda.',
                    () => { }
                );
        } else {
            this.dataSource = new LicenciaBienestarSocialDataSource(
                this.dataService
            );
            this.dataSource.load(
                this.request,
                this.paginator.pageIndex + 1,
                this.paginator.pageSize
            );
        }
    }

    descargarResolucion = (row) => {
        const data = row;
        if (data.codigoDocumentoResolucion === null || data.codigoDocumentoResolucion === '00000000-0000-0000-0000-000000000000' ||
            data.codigoDocumentoResolucion === '') {
            this.dataService.Message().msgWarning('La licencia no tiene  resolución.', () => { });
            return;
        }
        console.log(data.detalleCertificado?.codigoDocumentoCertificado);
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(data.codigoDocumentoResolucion)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                    saveAs(response, "certificado.pdf");
                } else {
                    this.dataService.Message().msgWarning('No se pudo descargar resolución ', () => { });
                }
            });
    }

    handleVerResolucion = () => { }

    handleViewInfo = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(InformacionLicenciaComponent, {
            panelClass: 'informacion-licencia-dialog',
            width: '1180px',
            disableClose: true,
            data: {
                idLicencia: row.idLicencia,
                eliminado: false,
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.grabado) {
                this.handleBuscar();
            }
        });
    }

    handleEliminar = (row: any, i) => {
        if (row?.codigoEstadoLicencia === EstadoLicenciaEnum.ENVIADO ||
            row?.codigoEstadoLicencia === EstadoLicenciaEnum.PENDIENTE_DE_PROYECTO) {
            this.dialogRef = this.materialDialog.open(InformacionLicenciaComponent, {
                panelClass: 'informacion-licencia-dialog',
                width: '1180px',
                disableClose: true,
                data: {
                    idLicencia: row.idLicencia,
                    eliminado: true,
                    origen: OrigenEliminacionEnum.ENVIADO,
                    currentSession: this.currentSession
                },
            });
            this.dialogRef.afterClosed().subscribe((resp) => {
                if (resp?.grabado) {
                    this.handleBuscar();
                }
            });
        }
    }

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
                this.form.get('codigoModular').setValue(result.centroTrabajo.codigoCentroTrabajo);
            }
        });
    }

}

export class LicenciaBienestarSocialDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firstTime = false): void {
        this._loadingChange.next(false);

        if (data.anio === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Licencias()
                .getListaLicenciasBienestarResumen(data, pageIndex, pageSize)
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
                        if (!firstTime) {
                            this.dataService
                                .Message()
                                .msgWarning(
                                    'No se encontró información de la(s) licencia(s) para los criterios de búsqueda ingresados.',
                                    () => { }
                                );
                        }
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
